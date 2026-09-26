import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "ink",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "ink" | "leather" | "binding" | "gold" | "danger" | "success";
  className?: string;
}) {
  const tones: Record<string, string> = {
    ink: "text-ink bg-paper-deep/70",
    leather: "text-leather bg-leather/10",
    binding: "text-binding bg-binding/10",
    gold: "text-gold bg-gold/12",
    danger: "text-danger bg-danger/10",
    success: "text-success bg-success/12",
  };
  return (
    <Card className={cn("paper-texture", className)}>
      <CardContent className="flex items-center gap-4 pt-4">
        {icon && (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg border border-ink/5 [&_svg]:size-5",
              tones[tone],
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="letterhead text-faded">{label}</p>
          <p className="mt-1 truncate font-display text-3xl font-semibold leading-none text-ink">
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-sepia">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}