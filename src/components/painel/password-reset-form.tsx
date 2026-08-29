"use client";

import { KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordFields } from "@/components/painel/password-fields";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function PasswordResetForm() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Crie uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("As duas senhas precisam ser iguais.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("Este link expirou ou já foi utilizado. Solicite uma nova recuperação.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw new Error("Não foi possível salvar a nova senha. Solicite outro link e tente novamente.");
      }

      router.replace("/painel/loja");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível atualizar sua senha.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      {error ? <Alert title={error} variant="danger" /> : null}

      <PasswordFields
        confirmation={confirmation}
        disabled={submitting}
        idPrefix="reset"
        onConfirmationChange={setConfirmation}
        onPasswordChange={setPassword}
        password={password}
      />

      <Button className="w-full" disabled={submitting} size="lg" type="submit">
        {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <KeyRound aria-hidden="true" />}
        {submitting ? "Atualizando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
