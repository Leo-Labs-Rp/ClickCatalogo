"use client";

import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteCategoryAction, reorderCategoriesAction, saveCategoryAction } from "@/app/painel/(app)/categorias/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type CategoryItem = { id: string; nome: string; ordem: number; productCount: number };

export function CategoryManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [creating, setCreating] = useState(initialCategories.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [showGroupingSuggestion, setShowGroupingSuggestion] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveCategoryAction({ id: editing?.id, nome: String(form.get("nome") ?? "") });
      if (!result.ok) return setError(result.error);
      const savedCategory = result.data?.category;
      if (savedCategory) {
        setCategories((current) => editing
          ? current.map((category) => category.id === savedCategory.id
            ? { ...category, nome: savedCategory.nome, ordem: savedCategory.ordem }
            : category)
          : [...current, { ...savedCategory, productCount: 0 }]);
      }
      if (result.data?.showGroupingSuggestion) setShowGroupingSuggestion(true);
      setError(null);
      setCreating(false);
      setEditing(null);
    });
  }

  function remove(category: CategoryItem) {
    if (category.productCount > 0) {
      const label = category.productCount === 1
        ? "1 produto vinculado"
        : `${category.productCount} produtos vinculados`;
      setError(`A categoria “${category.nome}” possui ${label}. Crie outra categoria e mova os produtos para ela, ou exclua os produtos, antes de excluir a categoria.`);
      return;
    }

    if (!window.confirm(`Excluir a categoria “${category.nome}”?`)) return;

    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (!result.ok) return setError(result.error);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setError(null);
    });
  }

  function saveOrder(next: CategoryItem[]) {
    setCategories(next);
    setDraggedId(null);
    startTransition(async () => {
      const result = await reorderCategoriesAction(next.map((item) => item.id));
      if (!result.ok) setError(result.error);
    });
  }

  function move(categoryId: string, offset: -1 | 1) {
    const next = [...categories];
    const from = next.findIndex((item) => item.id === categoryId);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= next.length) return;
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    saveOrder(next);
  }

  function drop(overId: string) {
    if (!draggedId || draggedId === overId) return setDraggedId(null);
    const next = [...categories];
    const from = next.findIndex((item) => item.id === draggedId);
    const to = next.findIndex((item) => item.id === overId);
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    saveOrder(next);
  }

  return (
    <div className="grid gap-5">
      {error ? <Alert title={error} variant="danger" /> : null}
      {showGroupingSuggestion ? (
        <Alert
          description="Considere agrupar categorias parecidas para deixar a navegação do catálogo mais simples para seus clientes. Você pode continuar criando categorias normalmente."
          title="Seu catálogo chegou a 16 categorias"
          variant="warning"
        />
      ) : null}

      {creating || editing ? (
        <Card className="p-5">
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={submit}>
            <Field className="flex-1">
              <FieldLabel htmlFor="nome">{editing ? "Editar categoria" : "Nova categoria"}</FieldLabel>
              <Input autoFocus defaultValue={editing?.nome} id="nome" maxLength={80} name="nome" placeholder="Ex.: Bebidas, Presentes, Serviços" required />
            </Field>
            <div className="flex gap-2">
              <Button disabled={isPending} type="submit"><Plus aria-hidden="true" />{isPending ? "Salvando..." : editing ? "Salvar" : "Adicionar"}</Button>
              {categories.length > 0 ? <Button onClick={() => { setCreating(false); setEditing(null); }} type="button" variant="ghost"><X aria-hidden="true" />Cancelar</Button> : null}
            </div>
          </form>
        </Card>
      ) : (
        <div><Button onClick={() => setCreating(true)}><Plus aria-hidden="true" />Nova categoria</Button></div>
      )}

      {categories.length === 0 && !creating ? (
        <EmptyState action={<Button onClick={() => setCreating(true)}><Plus aria-hidden="true" />Criar categoria</Button>} description="Organize seu catálogo para seus clientes encontrarem tudo com facilidade." icon={Tags} title="Nenhuma categoria ainda" />
      ) : categories.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-xs text-[var(--app-foreground-muted)]">Arraste pelo ícone ou use as setas para reordenar. A ordem aparece igual na loja.</p>
          {categories.map((category, index) => (
            <Card
              className="flex items-center gap-3 p-3 sm:p-4"
              draggable
              key={category.id}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={() => setDraggedId(category.id)}
              onDrop={() => drop(category.id)}
            >
              <GripVertical aria-hidden="true" className="size-5 shrink-0 cursor-grab text-[var(--app-foreground-muted)]" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{category.nome}</p></div>
              <Button aria-label={`Mover ${category.nome} para cima`} disabled={isPending || index === 0} onClick={() => move(category.id, -1)} size="icon" variant="ghost"><ArrowUp aria-hidden="true" /></Button>
              <Button aria-label={`Mover ${category.nome} para baixo`} disabled={isPending || index === categories.length - 1} onClick={() => move(category.id, 1)} size="icon" variant="ghost"><ArrowDown aria-hidden="true" /></Button>
              <Button aria-label={`Editar ${category.nome}`} onClick={() => { setCreating(false); setEditing(category); }} size="icon" variant="ghost"><Pencil aria-hidden="true" /></Button>
              <Button aria-label={`Excluir ${category.nome}`} disabled={isPending} onClick={() => remove(category)} size="icon" variant="ghost"><Trash2 aria-hidden="true" /></Button>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
