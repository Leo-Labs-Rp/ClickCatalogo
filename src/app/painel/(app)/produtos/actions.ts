"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionError, type ActionResult } from "@/lib/actions/result";
import { requireTenant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const productSchema = z.object({
  ativo: z.boolean(),
  categoryId: z.uuid("Selecione uma categoria."),
  descricao: z.string().trim().max(1000).nullable(),
  id: z.uuid().optional(),
  nome: z.string().trim().min(1, "Digite o nome do produto.").max(120),
  preco: z.number()
    .min(0.01, "O preço deve ser maior que zero.")
    .max(99_999_999)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8,
      "Use no máximo duas casas decimais no preço.",
    ),
  variacaoInfo: z.string().trim().max(300).nullable(),
});

function parsePrice(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  return Number(normalized);
}

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function storagePathFromUrl(url: string | null) {
  if (!url) return null;
  const marker = "/storage/v1/object/public/produtos/";
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
}

export async function saveProductAction(formData: FormData): Promise<ActionResult> {
  const parsed = productSchema.safeParse({
    ativo: formData.get("ativo") !== "false",
    categoryId: formData.get("categoryId"),
    descricao: String(formData.get("descricao") ?? "").trim() || null,
    id: String(formData.get("id") ?? "") || undefined,
    nome: formData.get("nome"),
    preco: parsePrice(formData.get("preco")),
    variacaoInfo: String(formData.get("variacaoInfo") ?? "").trim() || null,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", ok: false };

  const fileEntry = formData.get("imagem");
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  if (file && (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE)) {
    return { error: "A imagem deve ser JPG, PNG ou WebP e ter no máximo 2 MB.", ok: false };
  }

  let uploadedPath: string | null = null;

  try {
    const { demo, tenant } = await requireTenant();
    if (demo) return { error: "O modo de demonstração não salva alterações.", ok: false };
    const supabase = await createClient();
    const { data: category } = await supabase.from("categories").select("id").eq("id", parsed.data.categoryId).eq("tenant_id", tenant.id).maybeSingle();
    if (!category) return { error: "A categoria escolhida não pertence à sua loja.", ok: false };

    let previousImageUrl: string | null = null;
    if (parsed.data.id) {
      const { data: product } = await supabase.from("products").select("imagem_url").eq("id", parsed.data.id).eq("tenant_id", tenant.id).maybeSingle();
      if (!product) return { error: "Produto não encontrado.", ok: false };
      previousImageUrl = product.imagem_url;
    }

    let imageUrl = previousImageUrl;
    if (file) {
      uploadedPath = `${tenant.id}/${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error: uploadError } = await supabase.storage.from("produtos").upload(uploadedPath, file, { cacheControl: "3600", contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      imageUrl = supabase.storage.from("produtos").getPublicUrl(uploadedPath).data.publicUrl;
    }

    const values = {
      ativo: parsed.data.ativo,
      category_id: parsed.data.categoryId,
      descricao: parsed.data.descricao,
      imagem_url: imageUrl,
      nome: parsed.data.nome,
      preco: parsed.data.preco,
      tenant_id: tenant.id,
      variacao_info: parsed.data.variacaoInfo,
    };

    if (parsed.data.id) {
      const { error } = await supabase.from("products").update(values).eq("id", parsed.data.id).eq("tenant_id", tenant.id);
      if (error) throw error;
    } else {
      const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("category_id", parsed.data.categoryId);
      const { error } = await supabase.from("products").insert({ ...values, ordem: count ?? 0 });
      if (error) throw error;
    }

    const previousPath = storagePathFromUrl(previousImageUrl);
    if (uploadedPath && previousPath) await supabase.storage.from("produtos").remove([previousPath]);

    revalidatePath("/painel/produtos");
    revalidatePath("/painel/loja");
    revalidatePath(`/loja/${tenant.slug}`);
    return { ok: true };
  } catch (error) {
    if (uploadedPath) {
      try {
        const supabase = await createClient();
        await supabase.storage.from("produtos").remove([uploadedPath]);
      } catch { /* A limpeza será feita posteriormente se a sessão tiver expirado. */ }
    }
    return actionError(error, "Não foi possível salvar o produto.");
  }
}

export async function toggleProductAction(id: string, ativo: boolean): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Produto inválido.", ok: false };
  try {
    const { demo, tenant } = await requireTenant();
    if (demo) return { error: "O modo de demonstração não altera a publicação.", ok: false };
    const supabase = await createClient();
    const { error } = await supabase.from("products").update({ ativo }).eq("id", id).eq("tenant_id", tenant.id);
    if (error) throw error;
    revalidatePath("/painel/produtos");
    revalidatePath(`/loja/${tenant.slug}`);
    return { ok: true };
  } catch (error) {
    return actionError(error, "Não foi possível alterar a visibilidade do produto.");
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Produto inválido.", ok: false };
  try {
    const { demo, tenant } = await requireTenant();
    if (demo) return { error: "O modo de demonstração não exclui dados.", ok: false };
    const supabase = await createClient();
    const { data: product } = await supabase.from("products").select("imagem_url").eq("id", id).eq("tenant_id", tenant.id).maybeSingle();
    if (!product) return { error: "Produto não encontrado.", ok: false };
    const { error } = await supabase.from("products").delete().eq("id", id).eq("tenant_id", tenant.id);
    if (error) throw error;
    const path = storagePathFromUrl(product.imagem_url);
    if (path) await supabase.storage.from("produtos").remove([path]);
    revalidatePath("/painel/produtos");
    revalidatePath(`/loja/${tenant.slug}`);
    return { ok: true };
  } catch (error) {
    return actionError(error, "Não foi possível excluir o produto.");
  }
}
