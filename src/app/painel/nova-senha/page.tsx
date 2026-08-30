import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PasswordResetForm } from "@/components/painel/password-reset-form";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Criar nova senha" };

export default async function NewPasswordPage() {
  let authenticated = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      authenticated = !error && Boolean(data.user);
    } catch {
      authenticated = false;
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-100 to-transparent" />
      <div className="relative w-full max-w-lg">
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-brand-700" />
          <CardHeader>
            <span className="mb-3 grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <KeyRound aria-hidden="true" className="size-5" />
            </span>
            <CardTitle as="h1" className="text-2xl">Crie uma nova senha</CardTitle>
            <CardDescription>Escolha uma senha segura para voltar ao painel da sua loja.</CardDescription>
          </CardHeader>
          <CardContent>
            {authenticated ? (
              <PasswordResetForm />
            ) : (
              <div className="grid gap-4">
                <Alert
                  description="Solicite uma nova recuperação para receber outro link seguro."
                  title="Este link é inválido ou expirou"
                  variant="warning"
                />
                <Link className={buttonVariants({ className: "w-full" })} href="/painel/recuperar-senha">
                  Solicitar novo link
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
