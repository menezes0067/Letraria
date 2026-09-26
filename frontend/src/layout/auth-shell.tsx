import type { ReactNode } from "react";

const LEFT_SPINES = ["DICKENS", "MACHADO DE ASSIS", "BORGES", "AUSTEN"];
const RIGHT_SPINES = ["TOLKIEN", "LISPECTOR", "GUIMARÃES ROSA", "GARCÍA MÁRQUEZ"];

const SPINE_COLOR: Record<string, string> = {
  DICKENS: "#21354b",
  "MACHADO DE ASSIS": "#8c3a22",
  BORGES: "#4d5c3b",
  AUSTEN: "#6b3c55",
  TOLKIEN: "#7c4a1e",
  LISPECTOR: "#5a3a2e",
  "GUIMARÃES ROSA": "#293d33",
  "GARCÍA MÁRQUEZ": "#3d4d5c",
};

function SpineColumn({ side, spines }: { side: "left" | "right"; spines: string[] }) {
  return (
    <div
      className={`pointer-events-none fixed inset-y-6 ${side === "left" ? "left-6" : "right-6"} hidden flex-col items-end justify-end gap-2 xl:flex`}
    >
      {spines.map((t) => (
        <span
          key={t}
          className="w-12 rounded-r-md rounded-l-sm py-6 font-display text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-parchment/90"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            background: SPINE_COLOR[t],
          }}
        >
          {t}
        </span>
      ))}
      <div className="h-2.5 w-56 rounded-sm bg-binding shadow-lg" />
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="paper-texture flex min-h-screen items-center justify-center px-4 py-10">
      <SpineColumn side="left" spines={LEFT_SPINES} />
      <SpineColumn side="right" spines={RIGHT_SPINES} />

      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-line-strong bg-parchment p-8 shadow-lift paper-texture">
          <div className="double-rule pointer-events-none absolute inset-x-7 top-4" />
          <div className="pointer-events-none absolute inset-x-7 bottom-4 double-rule" />
          {children}
        </div>

        <p className="mt-5 text-center text-xs text-faded">
          Letraria · Livraria de bairro — empréstimo de livros
        </p>
      </div>
    </div>
  );
}