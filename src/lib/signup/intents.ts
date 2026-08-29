import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function expireStaleSignupIntents(admin: AdminClient) {
  const { error } = await admin.rpc("expire_stale_signup_intents");

  if (error) {
    throw new Error(`Não foi possível liberar cadastros expirados: ${error.message}`);
  }
}
