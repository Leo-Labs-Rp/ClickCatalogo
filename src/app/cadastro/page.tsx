import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/cadastro/signup-form";

export const metadata: Metadata = { title: "Criar minha loja" };

export default function SignupPage() {
  return <main className="min-h-screen"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Link className="flex min-h-11 items-center gap-2 font-bold" href="/"><span className="grid size-8 place-items-center rounded-lg bg-brand-900 text-white"><ShoppingBag aria-hidden="true" className="size-4" /></span>ClickCatálogo</Link><Link className="flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--app-foreground-muted)] hover:text-brand-700" href="/"><ArrowLeft aria-hidden="true" className="size-4" />Voltar</Link></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><SignupForm /></div></main>;
}
