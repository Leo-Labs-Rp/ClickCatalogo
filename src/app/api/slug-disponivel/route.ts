import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env/public";
import { enforceRateLimit, PUBLIC_API_RATE_LIMITS } from "@/lib/security/rate-limit";
import { expireStaleSignupIntents } from "@/lib/signup/intents";
import { createAdminClient } from "@/lib/supabase/admin";
import { tenantSlugSchema } from "@/lib/tenants/slug";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, PUBLIC_API_RATE_LIMITS.slugAvailability);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = tenantSlugSchema.safeParse(request.nextUrl.searchParams.get("slug") ?? "");
  if (!parsed.success) return NextResponse.json({ available: false, message: parsed.error.issues[0]?.message ?? "Endereço inválido." });

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ available: null, configured: false, message: "Disponibilidade será confirmada após configurar o Supabase." });
  }

  const admin = createAdminClient();
  try {
    await expireStaleSignupIntents(admin);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Falha ao liberar cadastros expirados.");
    return NextResponse.json(
      { available: null, configured: true, message: "Não foi possível confirmar o endereço agora. Tente novamente." },
      { status: 503 },
    );
  }

  const [{ count: tenantCount }, { count: intentCount }] = await Promise.all([
    admin.from("tenants").select("id", { count: "exact", head: true }).eq("slug", parsed.data),
    admin.from("signup_intents").select("id", { count: "exact", head: true }).eq("slug", parsed.data).in("status", ["pendente", "pago"]),
  ]);
  const available = (tenantCount ?? 0) === 0 && (intentCount ?? 0) === 0;
  return NextResponse.json({ available, configured: true, message: available ? "Endereço disponível!" : "Este endereço já está em uso." });
}
