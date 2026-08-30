import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env/server";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    host: siteUrl,
    rules: {
      allow: ["/", "/loja/", "/termos", "/privacidade"],
      disallow: ["/api/", "/auth/", "/cadastro", "/painel"],
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
