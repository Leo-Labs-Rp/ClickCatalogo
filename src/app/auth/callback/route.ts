import { NextResponse, type NextRequest } from "next/server";

import { DEMO_COOKIE_NAME } from "@/lib/demo/panel-demo";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/painel/loja";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(new URL(next, url.origin));
      response.cookies.delete(DEMO_COOKIE_NAME);
      return response;
    }
  }

  const failurePath = next === "/painel/nova-senha"
    ? "/painel/recuperar-senha?erro=link-invalido"
    : "/painel?erro=link-invalido";

  return NextResponse.redirect(new URL(failurePath, url.origin));
}
