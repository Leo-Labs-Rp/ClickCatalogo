import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes da auditoria.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function rows(table, columns) {
  const { data, error } = await supabase.from(table).select(columns);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}

try {
  const [tenants, categories, products, subscriptions, intents, webhookEvents, bucketResult, rateLimitTableResult, emailLookupResult] = await Promise.all([
    rows("tenants", "id,owner_user_id,status,logo_url,banner_url"),
    rows("categories", "id,tenant_id"),
    rows("products", "id,tenant_id,category_id,imagem_url"),
    rows("subscriptions", "tenant_id,status,asaas_customer_id,asaas_subscription_id"),
    rows("signup_intents", "status,provisioned_tenant_id"),
    rows("asaas_webhook_events", "processed_at,processing_error,attempts"),
    supabase.storage.getBucket("produtos"),
    supabase.from("api_rate_limits").select("key_hash", { count: "exact", head: true }),
    supabase.rpc("email_has_tenant", { p_email: "setup-check@invalid.local" }),
  ]);

  if (bucketResult.error) throw new Error(`storage/produtos: ${bucketResult.error.message}`);
  if (rateLimitTableResult.error) throw new Error(`api_rate_limits: ${rateLimitTableResult.error.message}`);
  if (emailLookupResult.error) throw new Error(`email_has_tenant: ${emailLookupResult.error.message}`);

  const [{ error: rateLimitValidation }, { error: reorderValidation }] = await Promise.all([
    supabase.rpc("consume_api_rate_limit", {
      p_key_hash: "invalid",
      p_limit: 1,
      p_window_seconds: 60,
    }),
    supabase.rpc("reorder_categories", {
      p_ids: [],
      p_tenant_id: "00000000-0000-0000-0000-000000000000",
    }),
  ]);
  if (rateLimitValidation?.code !== "22023") {
    throw new Error("consume_api_rate_limit não rejeitou parâmetros inválidos como esperado.");
  }
  if (reorderValidation?.code !== "42501") {
    throw new Error("reorder_categories não rejeitou uma loja não autorizada como esperado.");
  }

  const tenantIds = new Set(tenants.map((item) => item.id));
  const categoryIds = new Set(categories.map((item) => item.id));
  const storagePathFromUrl = (value) => {
    if (!value) return null;
    const marker = "/storage/v1/object/public/produtos/";
    const index = value.indexOf(marker);
    return index >= 0 ? decodeURIComponent(value.slice(index + marker.length)) : null;
  };
  const referencedStoragePaths = new Set([
    ...tenants.flatMap((tenant) => [tenant.logo_url, tenant.banner_url]),
    ...products.map((product) => product.imagem_url),
  ].map(storagePathFromUrl).filter(Boolean));
  const storagePaths = [];
  for (const tenant of tenants) {
    const { data, error } = await supabase.storage.from("produtos").list(tenant.id, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`storage/produtos/${tenant.id}: ${error.message}`);
    storagePaths.push(...(data ?? []).map((object) => `${tenant.id}/${object.name}`));
  }
  const ownerCounts = tenants.reduce((counts, tenant) => {
    counts.set(tenant.owner_user_id, (counts.get(tenant.owner_user_id) ?? 0) + 1);
    return counts;
  }, new Map());

  const problems = {
    activeSubscriptionsMissingAsaasIds: subscriptions.filter((item) =>
      item.status === "ativo" && (!item.asaas_customer_id || !item.asaas_subscription_id)).length,
    duplicatedOwners: [...ownerCounts.values()].filter((count) => count > 1).length,
    orphanCategories: categories.filter((item) => !tenantIds.has(item.tenant_id)).length,
    orphanProducts: products.filter((item) =>
      !tenantIds.has(item.tenant_id) || !categoryIds.has(item.category_id)).length,
    orphanStorageObjects: storagePaths.filter((path) => !referencedStoragePaths.has(path)).length,
    paidIntentsWithoutTenant: intents.filter((item) =>
      item.status === "pago" && !item.provisioned_tenant_id).length,
    unprocessedWebhookEvents: webhookEvents.filter((item) =>
      !item.processed_at || item.processing_error).length,
  };
  const summary = {
    counts: {
      apiRateLimitEntries: rateLimitTableResult.count ?? 0,
      categories: categories.length,
      products: products.length,
      signupIntents: intents.length,
      subscriptions: subscriptions.length,
      tenants: tenants.length,
      webhookEvents: webhookEvents.length,
    },
    hardening: {
      distributedRateLimit: true,
      emailLookup: emailLookupResult.data === false,
      oneStorePerOwner: problems.duplicatedOwners === 0,
      reorderAuthorization: true,
    },
    problems,
    storage: {
      allowedMimeTypes: bucketResult.data.allowed_mime_types,
      fileSizeLimit: bucketResult.data.file_size_limit,
      name: bucketResult.data.name,
      public: bucketResult.data.public,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
  if (Object.values(problems).some((count) => count > 0)) process.exitCode = 2;
} catch (error) {
  console.error(error instanceof Error ? error.message : "Falha desconhecida na auditoria.");
  process.exitCode = 1;
}
