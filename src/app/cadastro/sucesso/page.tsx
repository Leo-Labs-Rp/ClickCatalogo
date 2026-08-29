import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SuccessStatus } from "@/components/cadastro/success-status";

export const metadata: Metadata = { title: "Sua loja está sendo criada", robots: { index: false, follow: false } };

export default async function SignupSuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-100),var(--app-background)_45%)] px-4 py-10 sm:py-16"><div className="mx-auto w-full max-w-2xl"><Link className="mb-7 flex min-h-11 items-center justify-center gap-2 font-bold" href="/"><span className="grid size-8 place-items-center rounded-lg bg-brand-900 text-white"><ShoppingBag aria-hidden="true" className="size-4" /></span>ClickCatálogo</Link><SuccessStatus reference={ref ?? null} /></div></main>;
}
