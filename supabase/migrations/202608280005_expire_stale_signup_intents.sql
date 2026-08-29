begin;

-- Libera slugs de checkouts pendentes que expiraram mesmo quando o webhook
-- CHECKOUT_EXPIRED não chegou. A função só pode ser chamada pela service role.
create or replace function public.expire_stale_signup_intents()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  expired_count integer;
begin
  update public.signup_intents
  set status = 'expirado'
  where status = 'pendente'
    and expires_at <= now();

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

revoke all on function public.expire_stale_signup_intents() from public, anon, authenticated;
grant execute on function public.expire_stale_signup_intents() to service_role;

select public.expire_stale_signup_intents();

commit;
