-- ClickCatálogo — schema consolidado para um projeto Supabase vazio.
-- Execute este arquivo uma única vez no SQL Editor.
-- Não execute este arquivo depois das migrations individuais.

begin;

create extension if not exists pgcrypto with schema extensions;

create table public.tenants (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  nome_loja text not null,
  logo_url text,
  banner_url text,
  descricao_curta text,
  whatsapp text not null,
  instagram text,
  endereco text,
  tema text not null default 'minimal',
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tenants_slug_format_check check (
    slug = lower(slug)
    and char_length(slug) between 3 and 60
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint tenants_slug_reserved_check check (
    slug not in ('admin', 'api', 'painel', 'loja', 'cadastro', 'app', 'www')
  ),
  constraint tenants_nome_loja_length_check check (
    char_length(btrim(nome_loja)) between 2 and 100
  ),
  constraint tenants_descricao_length_check check (
    descricao_curta is null or char_length(descricao_curta) <= 180
  ),
  constraint tenants_whatsapp_format_check check (
    whatsapp ~ '^55[0-9]{10,11}$'
  ),
  constraint tenants_tema_check check (
    tema in ('classico', 'natural', 'tech', 'delivery', 'elegante', 'minimal')
  ),
  constraint tenants_status_check check (
    status in ('ativo', 'inadimplente', 'cancelado')
  )
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_id_tenant_unique unique (id, tenant_id),
  constraint categories_nome_length_check check (
    char_length(btrim(nome)) between 1 and 80
  ),
  constraint categories_ordem_check check (ordem >= 0)
);

create unique index categories_tenant_nome_unique_idx
  on public.categories (tenant_id, lower(btrim(nome)));

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid not null,
  nome text not null,
  preco numeric(10, 2) not null,
  descricao text,
  imagem_url text,
  variacao_info text,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_category_same_tenant_fk
    foreign key (category_id, tenant_id)
    references public.categories(id, tenant_id)
    on delete restrict,
  constraint products_nome_length_check check (
    char_length(btrim(nome)) between 1 and 120
  ),
  constraint products_preco_check check (preco >= 0.01),
  constraint products_descricao_length_check check (
    descricao is null or char_length(descricao) <= 1000
  ),
  constraint products_variacao_length_check check (
    variacao_info is null or char_length(variacao_info) <= 300
  ),
  constraint products_ordem_check check (ordem >= 0)
);

create table public.subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asaas_customer_id text,
  asaas_subscription_id text unique,
  valor numeric(10, 2) not null default 27.00,
  status text not null default 'ativo',
  next_due_date date,
  portal_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subscriptions_valor_check check (valor > 0),
  constraint subscriptions_status_check check (
    status in ('ativo', 'atrasado', 'cancelado')
  )
);

create unique index subscriptions_one_current_per_tenant_idx
  on public.subscriptions (tenant_id)
  where status in ('ativo', 'atrasado');

-- Dados coletados antes do pagamento. Somente o backend com chave secreta
-- acessa esta tabela; o navegador passa por rotas de API validadas.
create table public.signup_intents (
  id uuid primary key default extensions.gen_random_uuid(),
  external_reference uuid not null default extensions.gen_random_uuid() unique,
  nome_loja text not null,
  whatsapp text not null,
  email text not null,
  slug text not null,
  tema text not null default 'minimal',
  terms_accepted_at timestamptz not null,
  privacy_accepted_at timestamptz not null,
  asaas_customer_id text,
  asaas_subscription_id text unique,
  asaas_checkout_id text unique,
  status text not null default 'pendente',
  provisioned_tenant_id uuid unique references public.tenants(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint signup_intents_nome_length_check check (
    char_length(btrim(nome_loja)) between 2 and 100
  ),
  constraint signup_intents_whatsapp_check check (
    whatsapp ~ '^55[0-9]{10,11}$'
  ),
  constraint signup_intents_email_normalized_check check (
    email = lower(email)
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint signup_intents_slug_format_check check (
    slug = lower(slug)
    and char_length(slug) between 3 and 60
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint signup_intents_slug_reserved_check check (
    slug not in ('admin', 'api', 'painel', 'loja', 'cadastro', 'app', 'www')
  ),
  constraint signup_intents_tema_check check (
    tema in ('classico', 'natural', 'tech', 'delivery', 'elegante', 'minimal')
  ),
  constraint signup_intents_status_check check (
    status in ('pendente', 'pago', 'expirado', 'cancelado')
  )
);

-- O id do evento evita processar duas vezes a mesma entrega do Asaas.
create table public.asaas_webhook_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  attempts integer not null default 1,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,

  constraint asaas_webhook_events_attempts_check check (attempts >= 1)
);

create index tenants_owner_user_id_idx on public.tenants (owner_user_id);
create index categories_tenant_order_idx
  on public.categories (tenant_id, ordem, created_at);
create index products_tenant_order_idx
  on public.products (tenant_id, category_id, ordem, created_at);
create index products_public_catalog_idx
  on public.products (tenant_id, category_id, ordem, created_at)
  where ativo = true;
create index subscriptions_tenant_idx on public.subscriptions (tenant_id);
create index subscriptions_asaas_customer_idx
  on public.subscriptions (asaas_customer_id)
  where asaas_customer_id is not null;
create unique index signup_intents_active_slug_unique_idx
  on public.signup_intents (slug)
  where status in ('pendente', 'pago');
create index signup_intents_asaas_customer_idx
  on public.signup_intents (asaas_customer_id)
  where asaas_customer_id is not null;
create index signup_intents_pending_expiry_idx
  on public.signup_intents (expires_at)
  where status = 'pendente';

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger signup_intents_set_updated_at
before update on public.signup_intents
for each row execute function public.set_updated_at();

alter table public.tenants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.subscriptions enable row level security;
alter table public.signup_intents enable row level security;
alter table public.asaas_webhook_events enable row level security;

revoke all on table public.tenants from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;
revoke all on table public.signup_intents from anon, authenticated;
revoke all on table public.asaas_webhook_events from anon, authenticated;

grant select on table public.tenants to authenticated;
grant update (
  slug,
  nome_loja,
  logo_url,
  banner_url,
  descricao_curta,
  whatsapp,
  instagram,
  endereco,
  tema
) on table public.tenants to authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select on table public.subscriptions to authenticated;

create policy tenants_select_own
on public.tenants
for select
to authenticated
using (owner_user_id = (select auth.uid()));

create policy tenants_update_own
on public.tenants
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

create policy categories_manage_own
on public.categories
for all
to authenticated
using (
  exists (
    select 1
    from public.tenants
    where tenants.id = categories.tenant_id
      and tenants.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.tenants
    where tenants.id = categories.tenant_id
      and tenants.owner_user_id = (select auth.uid())
  )
);

create policy products_manage_own
on public.products
for all
to authenticated
using (
  exists (
    select 1
    from public.tenants
    where tenants.id = products.tenant_id
      and tenants.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.tenants
    where tenants.id = products.tenant_id
      and tenants.owner_user_id = (select auth.uid())
  )
);

create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using (
  exists (
    select 1
    from public.tenants
    where tenants.id = subscriptions.tenant_id
      and tenants.owner_user_id = (select auth.uid())
  )
);

-- Retorna somente os campos necessários ao catálogo público.
create or replace function public.get_public_catalog(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug', tenant.slug,
    'nome_loja', tenant.nome_loja,
    'logo_url', tenant.logo_url,
    'banner_url', tenant.banner_url,
    'descricao_curta', tenant.descricao_curta,
    'whatsapp', tenant.whatsapp,
    'instagram', tenant.instagram,
    'endereco', tenant.endereco,
    'tema', tenant.tema,
    'status', tenant.status,
    'categorias', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', category.id,
            'nome', category.nome,
            'ordem', category.ordem,
            'produtos', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', product.id,
                    'nome', product.nome,
                    'preco', product.preco,
                    'descricao', product.descricao,
                    'imagem_url', product.imagem_url,
                    'variacao_info', product.variacao_info,
                    'ordem', product.ordem
                  )
                  order by product.ordem, product.created_at
                )
                from public.products as product
                where product.tenant_id = tenant.id
                  and product.category_id = category.id
                  and product.ativo = true
              ),
              '[]'::jsonb
            )
          )
          order by category.ordem, category.created_at
        )
        from public.categories as category
        where category.tenant_id = tenant.id
      ),
      '[]'::jsonb
    )
  )
  from public.tenants as tenant
  where tenant.slug = lower(btrim(p_slug))
    and tenant.status in ('ativo', 'inadimplente');
$$;

create or replace function public.get_public_store_status(p_slug text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select tenant.status
  from public.tenants as tenant
  where tenant.slug = lower(btrim(p_slug));
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.get_public_catalog(text) from public;
revoke all on function public.get_public_store_status(text) from public;
grant execute on function public.get_public_catalog(text) to anon, authenticated;
grant execute on function public.get_public_store_status(text) to anon, authenticated;

comment on function public.get_public_catalog(text) is
  'Retorna somente os dados públicos de um catálogo ativo ou inadimplente.';
comment on function public.get_public_store_status(text) is
  'Expõe somente o status necessário para a tela pública de indisponibilidade.';

-- O bucket também armazena logo e banner. A primeira pasta sempre deve ser
-- o UUID do tenant: {tenant_id}/arquivo.webp.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'produtos',
  'produtos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy produtos_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'produtos');

create policy produtos_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'produtos'
  and exists (
    select 1
    from public.tenants
    where tenants.id::text = (storage.foldername(name))[1]
      and tenants.owner_user_id = (select auth.uid())
  )
);

create policy produtos_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'produtos'
  and exists (
    select 1
    from public.tenants
    where tenants.id::text = (storage.foldername(name))[1]
      and tenants.owner_user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'produtos'
  and exists (
    select 1
    from public.tenants
    where tenants.id::text = (storage.foldername(name))[1]
      and tenants.owner_user_id = (select auth.uid())
  )
);

create policy produtos_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'produtos'
  and exists (
    select 1
    from public.tenants
    where tenants.id::text = (storage.foldername(name))[1]
      and tenants.owner_user_id = (select auth.uid())
  )
);

commit;
