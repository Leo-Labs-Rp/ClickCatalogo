import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border bg-[var(--app-surface)] shadow-[var(--shadow-elevation)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-1.5 p-6 pb-0", className)} {...props} />;
}

export function CardTitle({ as: Element = "h3", className, ...props }: ComponentProps<"h3"> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Element
      className={cn("text-lg font-semibold tracking-tight text-[var(--app-foreground)]", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-6 text-[var(--app-foreground-muted)]", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}
