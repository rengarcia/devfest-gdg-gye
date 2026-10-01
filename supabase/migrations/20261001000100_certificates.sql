-- Attendance and participation certificates. Organizers (public.staff) record attendance by
-- scanning the attendee's QR, by email, or by importing a list after the event; each attendance
-- issues a certificate, which the attendee sees once the event's certificates are opened.

create table public.attendances (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id bigint not null references public.events (id) on delete cascade,
  method text not null check (method in ('qr', 'manual', 'import')),
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references auth.users (id) on delete set null,
  primary key (user_id, event_id)
);

create index attendances_event_idx on public.attendances (event_id);
create index attendances_checked_in_by_idx on public.attendances (checked_in_by);

alter table public.attendances enable row level security;
create policy "Users read their attendances" on public.attendances
  for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.attendances from anon, authenticated;
grant select on public.attendances to authenticated;

-- `kind` leaves room for speaker or volunteer certificates later.
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id bigint not null references public.events (id) on delete cascade,
  kind text not null default 'participation' check (kind in ('participation')),
  -- Printed on the certificate and checked at /verificar.
  code text not null unique default private.random_code(10),
  issued_at timestamptz not null default now(),
  unique (user_id, event_id, kind)
);

create index certificates_event_idx on public.certificates (event_id);

alter table public.certificates enable row level security;
create policy "Users read their certificates once open" on public.certificates
  for select to authenticated using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.events e where e.id = event_id and e.certificates_open)
  );
revoke insert, update, delete on public.certificates from anon, authenticated;
grant select on public.certificates to authenticated;

create function private.issue_participation_certificate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.certificates (user_id, event_id, kind)
  values (new.user_id, new.event_id, 'participation')
  on conflict (user_id, event_id, kind) do nothing;
  return new;
end;
$$;

create trigger attendances_issue_certificate
  after insert on public.attendances
  for each row execute function private.issue_participation_certificate();

/* Check-in (staff only) ----------------------------------------------------------------------- */

create function private.require_staff()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end;
$$;

create function private.event_id(p_event text)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  found_id bigint;
begin
  select e.id into found_id from public.events e where e.slug = p_event;
  if found_id is null then
    raise exception 'unknown_event' using errcode = '22023';
  end if;
  return found_id;
end;
$$;

-- Records one attendance and tells the scanner who it was and whether they were already in.
create function private.check_in_user(p_user uuid, p_event bigint, p_method text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted boolean;
begin
  insert into public.attendances (user_id, event_id, method, checked_in_by)
  values (p_user, p_event, p_method, auth.uid())
  on conflict (user_id, event_id) do nothing;
  inserted := found;
  return (
    select jsonb_build_object(
      'status', case when inserted then 'checked_in' else 'already' end,
      'first_name', p.first_name,
      'last_name', p.last_name
    )
    from public.profiles p where p.id = p_user
  );
end;
$$;

create function public.check_in(p_code text, p_event text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid;
begin
  perform private.require_staff();
  select p.id into uid from public.profiles p where p.checkin_code = upper(btrim(p_code));
  if uid is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  return private.check_in_user(uid, private.event_id(p_event), 'qr');
end;
$$;

create function public.check_in_by_email(p_email text, p_event text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid;
begin
  perform private.require_staff();
  select p.id into uid
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(btrim(p_email));
  if uid is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  return private.check_in_user(uid, private.event_id(p_event), 'manual');
end;
$$;

-- Bulk fallback after the event. Emails without an account are returned to the organizer and
-- never stored: those people have not consented to anything.
create function public.import_attendance(p_event text, p_emails text[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  event bigint;
  checked_in integer;
  already integer;
  unmatched jsonb;
begin
  perform private.require_staff();
  event := private.event_id(p_event);

  with input as (
    select distinct lower(btrim(e)) as email from unnest(p_emails) e where btrim(e) <> ''
  ),
  matched as (
    select p.id
    from input i
    join auth.users u on lower(u.email) = i.email
    join public.profiles p on p.id = u.id
  ),
  inserted as (
    insert into public.attendances (user_id, event_id, method, checked_in_by)
    select m.id, event, 'import', auth.uid() from matched m
    on conflict (user_id, event_id) do nothing
    returning 1
  )
  select
    (select count(*) from inserted),
    (select count(*) from matched) - (select count(*) from inserted)
  into checked_in, already;

  select coalesce(jsonb_agg(i.email order by i.email), '[]'::jsonb) into unmatched
  from (select distinct lower(btrim(e)) as email from unnest(p_emails) e where btrim(e) <> '') i
  where not exists (
    select 1 from auth.users u join public.profiles p on p.id = u.id where lower(u.email) = i.email
  );

  return jsonb_build_object('checked_in', checked_in, 'already', already, 'unmatched', unmatched);
end;
$$;

/* Public verification ------------------------------------------------------------------------- */

-- Anyone holding a certificate code can check it is genuine. The holder's name is only shown
-- while they keep the `public_verification` purpose granted.
create function public.verify_certificate(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'code', c.code,
    'kind', c.kind,
    'event', e.name,
    'date', e.date,
    'issued_at', c.issued_at,
    'holder', case
      when cc.granted then p.first_name || ' ' || p.last_name
    end
  )
  from public.certificates c
  join public.events e on e.id = c.event_id and e.certificates_open
  join public.profiles p on p.id = c.user_id
  left join public.current_consents cc
    on cc.user_id = c.user_id and cc.purpose = 'public_verification'
  where c.code = upper(btrim(p_code));
$$;

/* Access export, now with attendance and certificates ----------------------------------------- */

create or replace function public.export_my_data()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'exported_at', now(),
    'account', (
      select jsonb_build_object('email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at)
      from auth.users u where u.id = auth.uid()
    ),
    'profile', (select to_jsonb(p) - 'id' from public.profiles p where p.id = auth.uid()),
    'consents', coalesce((
      select jsonb_agg(to_jsonb(c) - 'id' - 'user_id' order by c.created_at, c.id)
      from public.consents c where c.user_id = auth.uid()
    ), '[]'::jsonb),
    'attendances', coalesce((
      select jsonb_agg(jsonb_build_object('event', e.name, 'method', a.method, 'checked_in_at', a.checked_in_at)
        order by a.checked_in_at)
      from public.attendances a join public.events e on e.id = a.event_id
      where a.user_id = auth.uid()
    ), '[]'::jsonb),
    'certificates', coalesce((
      select jsonb_agg(jsonb_build_object('event', e.name, 'kind', c.kind, 'code', c.code, 'issued_at', c.issued_at)
        order by c.issued_at)
      from public.certificates c join public.events e on e.id = c.event_id
      where c.user_id = auth.uid()
    ), '[]'::jsonb),
    'staff', (select s.role from public.staff s where s.user_id = auth.uid())
  );
$$;

revoke execute on function
  public.check_in(text, text),
  public.check_in_by_email(text, text),
  public.import_attendance(text, text[]),
  public.verify_certificate(text)
from public, anon;

grant execute on function
  public.check_in(text, text),
  public.check_in_by_email(text, text),
  public.import_attendance(text, text[])
to authenticated;

grant execute on function public.verify_certificate(text) to anon, authenticated;

revoke execute on all functions in schema private from public, anon, authenticated;
