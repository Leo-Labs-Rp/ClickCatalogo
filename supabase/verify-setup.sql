-- ClickCatálogo — verificação somente leitura após executar schema.sql.
-- Este arquivo não cria nem altera dados.

select
  tablename,
  rowsecurity as rls_ativo
from pg_tables
where schemaname = 'public'
  and tablename in (
    'tenants',
    'categories',
    'products',
    'subscriptions',
    'signup_intents',
    'asaas_webhook_events',
    'api_rate_limits'
  )
order by tablename;

select
  routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'expire_stale_signup_intents',
    'consume_api_rate_limit',
    'email_has_tenant',
    'get_public_catalog',
    'get_public_store_status',
    'reorder_categories',
    'set_updated_at'
  )
order by routine_name;

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'produtos';

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where (schemaname = 'public' and tablename in (
  'tenants',
  'categories',
  'products',
  'subscriptions'
))
or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;
