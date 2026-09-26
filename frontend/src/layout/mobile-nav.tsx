import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

export interface MobileNavItem {
  to: string;
  short: string;
  icon: LucideIcon;
}

export function MobileNav({ items }: { items: MobileNavItem[] }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-[#21140c]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] transition-colors",
                "hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold",
                isActive
                  ? "text-gold-soft"
                  : "text-parchment/55",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gold-soft" />
                )}
                <item.icon className="size-4.5" />
                <span>{item.short}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}