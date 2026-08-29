import "server-only";

import { NextResponse } from "next/server";

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function enforceSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const host = firstHeaderValue(request.headers.get("x-forwarded-host"))
      ?? firstHeaderValue(request.headers.get("host"))
      ?? requestUrl.host;
    const protocol = firstHeaderValue(request.headers.get("x-forwarded-proto"))
      ?? requestUrl.protocol.replace(":", "");

    if (originUrl.host === host && originUrl.protocol === `${protocol}:`) return null;
  } catch {
    // Uma origem malformada deve ser rejeitada como qualquer origem externa.
  }

  return NextResponse.json({ error: "Origem da solicitação não permitida." }, { status: 403 });
}
