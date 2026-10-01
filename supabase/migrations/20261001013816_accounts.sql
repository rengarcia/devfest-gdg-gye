-- Attendee accounts: profile, per-purpose consent log and the data-subject rights the LOPDP
-- (Ley Orgánica de Protección de Datos Personales, Ecuador) requires: access, rectification,
-- deletion, objection and portability.
--
-- The browser talks to these tables with the publishable key, so every table has RLS. Reads go
-- straight through the policies; every write with side effects goes through a security definer
-- function below, which validates the input and keeps the consent log append-only.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

/* Helpers ------------------------------------------------------------------------------------- */

-- Unambiguous upper-case code (no 0/O, 1/I). 32 symbols, so each byte maps without bias.
create function private.random_code(len integer)
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  bytes bytea := extensions.gen_random_bytes(len);
  result text := '';
begin
  for i in 0 .. len - 1 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return result;
end;
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

/* Purposes ------------------------------------------------------------------------------------ */

-- What personal data is used for. Consent is asked per purpose (LOPDP art. 8: specific), so a new
-- feature such as giveaways or the game adds a row here and asks for its own consent.
create table public.purposes (
  key text primary key,
  -- Required purposes are a condition of having an account; they can only be withdrawn by deleting it.
  required boolean not null default false,
  -- Inactive purposes are not offered yet.
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.purposes (key, required, active) values
  ('account', true, true),
  ('public_verification', false, true),
  ('giveaways', false, false),
  ('game', false, false);

alter table public.purposes enable row level security;
create policy "Purposes are public" on public.purposes for select to anon, authenticated using (true);

/* Profiles ------------------------------------------------------------------------------------ */

-- The minimum we need: a name for the certificate. The email stays in auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 80),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 80),
  -- Content of the attendee's QR code, scanned at the door.
  checkin_code text not null unique default private.random_code(12),
  -- The attendee declared being 15 or older, the age from which they can consent on their own.
  age_confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Drives the retention rule: accounts unused for three years are deleted.
  last_seen_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
create policy "Users read their profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users update their profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Rectification covers the name only; everything else is set by the functions below.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (first_name, last_name) on public.profiles to authenticated;

/* Consents ------------------------------------------------------------------------------------ */

-- Append-only evidence that consent was given or withdrawn, with the policy version shown at the
-- time (LOPDP art. 8 and Reglamento: the controller must be able to prove it).
create table public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null references public.purposes (key),
  granted boolean not null,
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  user_agent text check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

create index consents_user_purpose_idx on public.consents (user_id, purpose, created_at desc, id desc);

alter table public.consents enable row level security;
create policy "Users read their consents" on public.consents
  for select to authenticated using ((select auth.uid()) = user_id);

revoke insert, update, delete, truncate on public.consents from anon, authenticated;
grant select on public.consents to authenticated;

-- Latest decision per purpose.
create view public.current_consents
with (security_invoker = true)
as
select distinct on (user_id, purpose)
  user_id, purpose, granted, policy_version, created_at
from public.consents
order by user_id, purpose, created_at desc, id desc;

grant select on public.current_consents to authenticated;

/* Events -------------------------------------------------------------------------------------- */

-- One row per DevFest edition; slug is the year, as in the Sanity site settings.
create table public.events (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  date date not null,
  -- Certificates become visible to attendees once organizers open them after the event.
  certificates_open boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.events (slug, name, date) values ('2026', 'DevFest Guayaquil 2026', '2026-12-05');

alter table public.events enable row level security;
create policy "Events are public" on public.events for select to anon, authenticated using (true);
revoke insert, update, delete on public.events from anon, authenticated;

/* Staff --------------------------------------------------------------------------------------- */

-- Organizers who can check people in. Granted with SQL or from the dashboard, never by the app.
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'organizer' check (role in ('organizer')),
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;
create policy "Users see whether they are staff" on public.staff
  for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.staff from anon, authenticated;
grant select on public.staff to authenticated;

create function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

/* Functions called by the app ----------------------------------------------------------------- */

-- Completes sign-up after the email code: profile plus one consent row per purpose answered.
create function public.register(
  p_first_name text,
  p_last_name text,
  p_consents jsonb,
  p_policy_version text,
  p_age_confirmed boolean,
  p_user_agent text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  purpose record;
  profile public.profiles;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = uid) then
    raise exception 'already_registered' using errcode = '23505';
  end if;
  if p_age_confirmed is not true then
    raise exception 'age_required' using errcode = '22023';
  end if;
  if jsonb_typeof(p_consents) is distinct from 'object' then
    raise exception 'invalid_consents' using errcode = '22023';
  end if;
  for purpose in select key from public.purposes where active and required loop
    if (p_consents ->> purpose.key) is distinct from 'true' then
      raise exception 'consent_required' using errcode = '22023', detail = purpose.key;
    end if;
  end loop;

  insert into public.profiles (id, first_name, last_name, age_confirmed_at)
  values (uid, btrim(p_first_name), btrim(p_last_name), now())
  returning * into profile;

  insert into public.consents (user_id, purpose, granted, policy_version, user_agent)
  select uid, p.key, (p_consents ->> p.key) = 'true', p_policy_version, left(p_user_agent, 500)
  from public.purposes p
  where p.active and p_consents ? p.key;

  return profile;
end;
$$;

-- Grants or withdraws one purpose. Required purposes can be re-accepted (for a new policy
-- version) but not withdrawn: withdrawing them means deleting the account.
create function public.set_consent(
  p_purpose text,
  p_granted boolean,
  p_policy_version text,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  is_required boolean;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.profiles where id = uid) then
    raise exception 'not_registered' using errcode = '22023';
  end if;
  select required into is_required from public.purposes where key = p_purpose and active;
  if not found then
    raise exception 'unknown_purpose' using errcode = '22023';
  end if;
  if is_required and p_granted is not true then
    raise exception 'required_purpose' using errcode = '22023';
  end if;

  insert into public.consents (user_id, purpose, granted, policy_version, user_agent)
  values (uid, p_purpose, p_granted, p_policy_version, left(p_user_agent, 500));
end;
$$;

-- Keeps the retention clock running while the account is in use.
create function public.touch_last_seen()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set last_seen_at = now() where id = auth.uid();
$$;

-- Right of access and portability: everything stored about the caller, as JSON.
create function public.export_my_data()
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
    'staff', (select s.role from public.staff s where s.user_id = auth.uid())
  );
$$;

-- Right of deletion: removes the auth user; every table cascades from it.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function
  public.register(text, text, jsonb, text, boolean, text),
  public.set_consent(text, boolean, text, text),
  public.touch_last_seen(),
  public.export_my_data(),
  public.delete_my_account()
from public, anon;

grant execute on function
  public.register(text, text, jsonb, text, boolean, text),
  public.set_consent(text, boolean, text, text),
  public.touch_last_seen(),
  public.export_my_data(),
  public.delete_my_account()
to authenticated;

revoke execute on all functions in schema private from public, anon, authenticated;

/* Retention ----------------------------------------------------------------------------------- */

create extension if not exists pg_cron;

-- Daily purge, per the privacy notice:
-- * people who asked for a code but never finished registering (no consent given) after 7 days;
-- * registered accounts not used for 3 years.
create function private.purge_accounts()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users u
  where u.created_at < now() - interval '7 days'
    and not exists (select 1 from public.profiles p where p.id = u.id);

  delete from auth.users u
  using public.profiles p
  where p.id = u.id and p.last_seen_at < now() - interval '3 years';
$$;

select cron.schedule('purge-accounts', '17 8 * * *', 'select private.purge_accounts()');
