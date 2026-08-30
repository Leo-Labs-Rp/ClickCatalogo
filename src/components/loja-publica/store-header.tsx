import { MessageCircle, Store } from "lucide-react";

import { buttonVariants } from "@/components/ui";
import { createWhatsAppUrl } from "@/lib/whatsapp/url";

import { CatalogImage } from "./catalog-image";
import { StoreLogo } from "./store-logo";

export type StoreHeaderProps = {
  bannerUrl: string | null;
  description: string | null;
  framed?: boolean;
  logoUrl: string | null;
  storeName: string;
  whatsapp: string;
};

export function StoreHeader({
  bannerUrl,
  description,
  framed = false,
  logoUrl,
  storeName,
  whatsapp,
}: StoreHeaderProps) {
  const whatsappUrl = createWhatsAppUrl(
    whatsapp,
    `Olá! Vim pelo catálogo da ${storeName} e gostaria de fazer um pedido.`,
  );
  const Heading = framed ? "h2" : "h1";
  const bannerFallback = (
    <div
      aria-label="Banner padrão da loja"
      className="absolute inset-0 grid place-items-center bg-[var(--cor-imagem-fundo)] text-[var(--cor-primaria)]"
      role="img"
    >
      <Store aria-hidden="true" className="size-10 opacity-20" strokeWidth={1.5} />
    </div>
  );

  return (
    <header className="@container overflow-hidden border-b border-[var(--cor-borda)] bg-[var(--cor-fundo)]">
      <div className="relative h-[8.5rem] w-full overflow-hidden bg-[var(--cor-imagem-fundo)] @2xl:aspect-[21/9] @2xl:h-auto @2xl:min-h-40 @2xl:max-h-72">
        {bannerUrl ? (
          <div className="absolute left-1/2 top-1/2 aspect-[21/9] w-full -translate-x-1/2 -translate-y-1/2">
            <CatalogImage
              alt={`Banner da ${storeName}`}
              className="object-cover object-center"
              fallback={bannerFallback}
              fill
              loading={framed ? "lazy" : "eager"}
              sizes="100vw"
              src={bannerUrl}
            />
          </div>
        ) : (
          bannerFallback
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0_/_0.72),rgb(0_0_0_/_0.22)_58%,transparent)]"
        />
      </div>

      <div className="relative z-10 mx-auto -mt-24 flex w-full max-w-[var(--content-width)] flex-col gap-4 px-4 pb-6 @xl:flex-row @xl:items-end @xl:justify-between @2xl:-mt-20 @2xl:px-6 @5xl:px-8">
        <div className="flex w-full min-w-0 items-start gap-4 @xl:flex-1">
          <StoreLogo eager={!framed} logoUrl={logoUrl} storeName={storeName} />
          <div className="min-w-0 flex-1 pt-1">
            <Heading className="break-words text-2xl font-bold tracking-tight text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.45)] @xl:truncate @2xl:text-3xl">
              {storeName}
            </Heading>
            {description ? (
              <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-white/85 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.45)] @xl:line-clamp-1">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <a
          className={buttonVariants({ className: "w-full @xl:w-auto", size: "md", variant: "theme" })}
          href={whatsappUrl}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle aria-hidden="true" />
          Chamar no WhatsApp
        </a>
      </div>
    </header>
  );
}
