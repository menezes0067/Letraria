import * as React from "react";

import { cn } from "../../lib/utils";

const badgeVariants = (className?: string) =>
  cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide transition-colors",
    className,
  );

export function Badge(
  props: React.ComponentProps<"span"> & { variant?: "default" | "outline" | "soft" | "gold" | "success" | "danger" },
) {
  const { className, variant = "default", ...rest } = props;
  const palette: Record<NonNullable<typeof variant>, string> = {
    default: "border-binding/40 bg-binding text-bone",
    outline: "border-line-strong bg-transparent text-ink-soft",
    soft: "border-line bg-paper-deep/60 text-ink-soft",
    gold: "border-gold/50 bg-gold/15 text-gold",
    success: "border-success/40 bg-success-soft text-success",
    danger: "border-danger/40 bg-danger-soft text-danger",
  };
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants(palette[variant]), className)}
      {...rest}
    />
  );
}