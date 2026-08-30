import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  theme?: boolean;
  title: string;
};

export function EmptyState({ action, description, icon: Icon, theme = false, title }: EmptyStateProps) {
  return (
    <div className={theme ? "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-[var(--cor-borda)] bg-[var(--cor-superficie)] px-6 py-12 text-center" : "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed bg-white px-6 py-12 text-center"}>
      <span className={theme ? "grid size-12 place-items-center rounded-full bg-[var(--cor-imagem-fundo)] text-[var(--cor-primaria)]" : "grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700"}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className={theme ? "mt-4 font-semibold text-[var(--cor-texto)]" : "mt-4 font-semibold text-[var(--app-foreground)]"}>{title}</h3>
      <p className={theme ? "mt-1 max-w-sm text-sm leading-6 text-[var(--cor-texto-suave)]" : "mt-1 max-w-sm text-sm leading-6 text-[var(--app-foreground-muted)]"}>
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
