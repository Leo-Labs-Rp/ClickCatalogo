import { ArrowLeft, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PasswordRecoveryRequestForm } from "@/components/painel/password-recovery-request-form";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Recuperar senha" };

type RecoveryPageProps = {
  searchParams: Promise<{ erro?: string | string[] }>;
};

export default async function PasswordRecoveryPage({ searchParams }: RecoveryPageProps) {
  const errorCode = (await searchParams).erro;
  const invalidLink = errorCode === "link-invalido";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-100 to-transparent" />
      <div className="relative w-full max-w-md">
        <Link
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--app-foreground-muted)] hover:text-brand-700"
          href="/painel"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para entrar
        </Link>

        <Card className="overflow-hidden">
          <div className="h-1.5 bg-brand-700" />
          <CardHeader>
            <span className="mb-3 grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <KeyRound aria-hidden="true" className="size-5" />
            </span>
            <CardTitle className="text-2xl">Recupere seu acesso</CardTitle>
            <CardDescription>Enviaremos um link seguro para você escolher uma nova senha.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {invalidLink ? (
              <Alert
                description="Solicite outro e use apenas o link mais recente recebido."
                title="Este link é inválido ou expirou"
                variant="warning"
              />
            ) : null}
            <PasswordRecoveryRequestForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
