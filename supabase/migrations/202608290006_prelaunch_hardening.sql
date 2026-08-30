begin;

-- O painel atual gerencia uma loja por conta. A restrição impede que um mesmo
-- usuário receba duas lojas sem que exista uma interface para alternar entre elas.
create unique index if not exists tenants_owner_user_id_unique_idx
  on public.tenants (owner_user_id);

create unique index if not exists signup_intents_active_email_unique_idx
  on public.signup_intents (lower(email))
  where status in ('pendente', 'pago');

-- Consulta usada antes do checkout para impedir uma segunda compra com o mesmo
-- e-mail. Somente a service role pode consultar auth.users por esta função.
create or replace function public.email_has_tenant(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as auth_user
    join public.tenants as tenant on tenant.owner_user_id = auth_user.id
    where lower(auth_user.email) = lower(btrim(p_email))
  );
$$;

revoke all on function public.email_has_tenant(text) from public, anon, authenticated;
grant execute on function public.email_has_tenant(text) to service_role;

-- Salva toda a ordem em uma única transação e rejeita listas incompletas,
-- duplicadas ou pertencentes a outra loja.
create or replace function public.reorder_categories(p_tenant_id uuid, p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_count integer;
begin
  if (select auth.uid()) is null or not exists (
    select 1
    from public.tenants
    where id = p_tenant_id
      and owner_user_id = (select auth.uid())
  ) then
    raise exception 'Loja não autorizada.' using errcode = '42501';
  end if;

  select count(*)::integer
  into category_count
  from public.categories
  where tenant_id = p_tenant_id;

  if p_ids is null
    or cardinality(p_ids) <> category_count
    or (select count(distinct listed.id) from unnest(p_ids) as listed(id)) <> category_count
    or exists (
      select 1
      from unnest(p_ids) as listed(id)
      where not exists (
        select 1
        from public.categories
        where categories.id = listed.id
          and categories.tenant_id = p_tenant_id
      )
    ) then
    raise exception 'Ordem de categorias inválida.' using errcode = '22023';
  end if;

  update public.categories as category
  set ordem = ordered.position - 1
  from unnest(p_ids) with ordinality as ordered(id, position)
  where category.id = ordered.id
    and category.tenant_id = p_tenant_id;

  return category_count;
end;
$$;

revoke all on function public.reorder_categories(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_categories(uuid, uuid[]) to authenticated;

-- Limitador compartilhado por todas as instâncias das Functions do Netlify.
-- O identificador do cliente armazenado é um HMAC, nunca o IP em texto puro.
create table if not exists public.api_rate_limits (
  key_hash text primary key,
  request_count integer not null default 1 check (request_count > 0),
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;

create index if not exists api_rate_limits_reset_at_idx
  on public.api_rate_limits (reset_at);

create or replace function public.consume_api_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
  current_reset timestamptz;
  current_time timestamptz := clock_timestamp();
begin
  if p_key_hash is null or length(p_key_hash) <> 64
    or p_limit < 1
    or p_window_seconds < 1 then
    raise exception 'Parâmetros de rate limit inválidos.' using errcode = '22023';
  end if;

  if random() < 0.01 then
    delete from public.api_rate_limits
    where reset_at < current_time - interval '1 day';
  end if;

  insert into public.api_rate_limits as rate_limit (
    key_hash,
    request_count,
    reset_at,
    updated_at
  )
  values (
    p_key_hash,
    1,
    current_time + make_interval(secs => p_window_seconds),
    current_time
  )
  on conflict (key_hash) do update
  set
    request_count = case
      when rate_limit.reset_at <= current_time then 1
      else rate_limit.request_count + 1
    end,
    reset_at = case
      when rate_limit.reset_at <= current_time
        then current_time + make_interval(secs => p_window_seconds)
      else rate_limit.reset_at
    end,
    updated_at = current_time
  returning request_count, rate_limit.reset_at
  into current_count, current_reset;

  return query select
    current_count <= p_limit,
    greatest(p_limit - current_count, 0),
    greatest(ceil(extract(epoch from current_reset - current_time))::integer, 1),
    current_reset;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to service_role;

commit;
