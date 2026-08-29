"use client";

import { Layers3, PackagePlus, Sparkles } from "lucide-react";
import { useState } from "react";

import { StorePreview, ThemePicker } from "@/components/loja-publica";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from "@/components/ui";
import { SAMPLE_CATALOG } from "@/lib/design-system/sample-catalog";
import { getTheme } from "@/lib/design-system/themes";
import type { TenantTheme } from "@/types/database";

export function DesignSystemShowcase() {
  const [theme, setTheme] = useState<TenantTheme>("natural");
  const selectedTheme = getTheme(theme);

  return (
    <div className="min-h-screen bg-[var(--app-background)]">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-[var(--content-width)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-900 text-[var(--brand-accent)]">
              <Layers3 aria-hidden="true" className="size-5" />
            </span>
            <span className="font-bold tracking-tight text-brand-900">ClickCatálogo</span>
          </div>
          <Badge variant="success">Design system · Etapa 2</Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[var(--content-width)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Sistema visual
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[var(--app-foreground)] sm:text-5xl">
            Uma base consistente para cada tela do produto.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-foreground-muted)] sm:text-lg">
            Seis identidades para as lojas, os mesmos componentes e uma experiência clara em
            qualquer tamanho de tela.
          </p>
        </section>

        <section className="mt-10 grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <Card className="xl:sticky xl:top-6">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Escolha um tema</CardTitle>
                <Sparkles aria-hidden="true" className="size-5 text-brand-600" />
              </div>
              <CardDescription>
                A prévia usa os mesmos componentes que serão exibidos na loja pública.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePicker onValueChange={setTheme} value={theme} />
              <div className="mt-5 rounded-lg bg-brand-50 p-4">
                <p className="text-sm font-semibold text-brand-900">{selectedTheme.name}</p>
                <p className="mt-1 text-xs leading-5 text-brand-700">
                  {selectedTheme.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--app-foreground)]">Prévia ao vivo</p>
              <span className="text-xs text-[var(--app-foreground-muted)]">Mobile-first</span>
            </div>
            <StorePreview catalog={SAMPLE_CATALOG} framed theme={theme} />
          </div>
        </section>

        <section className="mt-16 border-t pt-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Componentes de interface
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Prontos para cadastro e painel
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--app-foreground-muted)]">
              Controles, mensagens e estados compartilham espaçamento, foco e hierarquia.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Controles</CardTitle>
                <CardDescription>Exemplo dos elementos usados nos formulários.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <Field>
                  <FieldLabel htmlFor="showcase-store-name">Nome da loja</FieldLabel>
                  <Input defaultValue="Ateliê Aurora" id="showcase-store-name" />
                  <FieldDescription>Esse nome aparecerá no topo do catálogo.</FieldDescription>
                </Field>
                <div className="flex flex-wrap gap-3">
                  <Button>Salvar alterações</Button>
                  <Button variant="secondary">Ver catálogo</Button>
                  <Button variant="ghost">Cancelar</Button>
                </div>
              </CardContent>
            </Card>

            <EmptyState
              action={
                <Button size="sm">
                  <PackagePlus aria-hidden="true" />
                  Criar primeiro produto
                </Button>
              }
              description="Cadastre um produto para começar a montar seu catálogo."
              icon={PackagePlus}
              title="Nenhum produto ainda"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
