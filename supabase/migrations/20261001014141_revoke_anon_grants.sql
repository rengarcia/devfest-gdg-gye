-- Defence in depth: RLS already returns nothing to signed-out visitors, but they have no reason to
-- touch these tables at all, so drop the default grants Supabase gives the anon role.
revoke all on public.profiles, public.consents, public.current_consents, public.staff,
  public.attendances, public.certificates
from anon;

revoke insert, update, delete, truncate on public.purposes, public.events from anon, authenticated;
