import { BookCheck, Landmark, LibraryBig, LogOut, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useLibrary } from "../lib/library";
import { PROFILE_LABEL } from "../types";
import type { UserProfile } from "../types";
import { MobileNav } from "./mobile-nav";

interface NavItem {
  to: string;
  title: string;
  short: string;
  icon: LucideIcon;
  roles: UserProfile[];
}

const NAV: NavItem[] = [
  {
    to: "/app/inicio",
    title: "Sala de leitura",
    short: "Início",
    icon: Landmark,
    roles: ["bibliotecario", "aluno"],
  },
  {
    to: "/app/catalogo",
    title: "Catálogo",
    short: "Catálogo",
    icon: LibraryBig,
    roles: ["bibliotecario", "aluno"],
  },
  {
    to: "/app/emprestimos",
    title: "Empréstimos",
    short: "Empréstimos",
    icon: BookCheck,
    roles: ["bibliotecario", "aluno"],
  },
  {
    to: "/app/leitores",
    title: "Leitores",
    short: "Leitores",
    icon: Users,
    roles: ["bibliotecario"],
  },
];

export function AppShell() {
  const { pathname } = useLocation();
  const { currentUser, signOut } = useLibrary();

  const role: UserProfile = currentUser?.profile ?? "aluno";
  const nav = NAV.filter((n) => n.roles.includes(role));

  const activeKey =
    nav.find((n) => pathname.startsWith(n.to))?.to ?? "/app/inicio";
  const title = nav.find((n) => n.to === activeKey)?.title ?? "Letraria";

  return (
    <div className="paper-texture flex min-h-screen flex-col">
      {/* ── Cabeçalho literário ── */}
      <header className="paper-texture sticky top-0 z-30 border-b-2 border-line-strong bg-parchment/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link
            to="/app/inicio"
            className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-gold-soft/70 bg-gold/10">
              <Landmark className="size-4.5 text-gold" />
            </span>
            <span className="font-display text-xl font-semibold tracking-[0.18em] text-ink">
              LETRARIA
            </span>
          </Link>

          {/* navegação — desktop */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 lg:flex"
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    isActive ? "text-ink" : "text-sepia hover:text-ink",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="size-4" />
                    {item.short}
                    {isActive && (
                      <span className="absolute inset-x-2.5 bottom-0 h-[3px] rounded-t-full bg-gold" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* usuário — desktop */}
          {currentUser && (
            <div className="hidden items-center gap-3 lg:flex">
              <Avatar className="size-9 border-line-strong">
                <AvatarFallback>
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-right leading-tight">
                <p className="truncate text-xs font-semibold text-ink">
                  {currentUser.name}
                </p>
                <p className="letterhead text-[0.6rem] text-faded">
                  {PROFILE_LABEL[currentUser.profile]}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sair"
                aria-label="Sair"
                className="text-sepia hover:bg-binding/10 hover:text-leather"
              >
                <LogOut />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 pt-8 sm:px-8 lg:pb-14">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-line-strong pb-5">
          <div className="min-w-0">
            <p className="letterhead text-faded">Letraria · Livraria de bairro</p>
            <h1 className="mt-2 truncate font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
              {title}
            </h1>
          </div>
          <p className="pb-1 font-serif text-sm italic text-sepia">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        <Outlet />
      </main>

      {/* ── Barra prateleira (mobile) ── */}
      <MobileNav
        items={nav.map(({ to, short, icon }) => ({ to, short, icon }))}
      />
    </div>
  );
}