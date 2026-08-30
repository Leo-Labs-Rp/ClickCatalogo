"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type CatalogImageProps = Omit<ImageProps, "onError" | "unoptimized"> & {
  fallback: React.ReactNode;
};

function isAllowedCatalogImage(src: ImageProps["src"]) {
  if (typeof src !== "string") return true;
  if (src.startsWith("/")) return true;
  if (src.startsWith("blob:")) return true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;

  try {
    const imageUrl = new URL(src);
    const expectedOrigin = new URL(supabaseUrl).origin;

    return (
      imageUrl.origin === expectedOrigin &&
      imageUrl.pathname.startsWith("/storage/v1/object/public/produtos/")
    );
  } catch {
    return false;
  }
}

export function CatalogImage({ alt, fallback, src, ...props }: CatalogImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);

  if (failedSrc === src || !isAllowedCatalogImage(src)) return fallback;

  return (
    <Image
      {...props}
      alt={alt}
      onError={() => setFailedSrc(src)}
      src={src}
      unoptimized={typeof src === "string" && src.startsWith("blob:")}
    />
  );
}
