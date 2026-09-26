import { Headphones, Layers, BookOpen } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { clothFor, FORMAT_STAMP } from "../../lib/dates";
import type { Book, BookFormat } from "../../types";
import { Badge } from "../ui/badge";

const FORMAT_ICON: Record<BookFormat, ReactNode> = {
  fisico: <BookOpen className="size-3.5" />,
  ebook: <Layers className="size-3.5" />,
  audiobook: <Headphones className="size-3.5" />,
};

/* ── Capa frontal ────────────────────────────────────────── */

export function BookFace({ book, className }: { book: Book; className?: string }) {
  const cloth = clothFor(book.title);
  const soldOut = book.format === "fisico" && book.availableQuantity <= 0;

  return (
    <div
      className={cn(
        "group relative aspect-[3/4.4] w-full select-none overflow-hidden rounded-r-lg rounded-l-sm",
        "shadow-paper ring-1 ring-ink/10 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
      style={{ backgroundColor: cloth.bg }}
    >
      <span
        className="absolute inset-y-0 left-0 w-2.5"
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,.28) 0%, rgba(255,255,255,.08) 45%, rgba(0,0,0,.16) 100%)",
        }}
      />
      <div className="absolute inset-2.5 rounded border border-gold-soft/70 px-3 pt-3 pb-2 flex flex-col">
        <div className="flex items-start justify-between">
          <span
            className="font-sans font-bold uppercase tracking-[0.18em] text-[0.58rem]"
            style={{ color: cloth.accent }}
          >
            {FORMAT_STAMP[book.format]}
          </span>
        </div>

        <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center gap-2">
          <div
            className="h-px w-8 mb-1"
            style={{ backgroundColor: cloth.accent, opacity: 0.7 }}
          />
          <h3
            className="font-display text-[0.95rem] leading-snug font-semibold drop-shadow-sm"
            style={{ color: cloth.text }}
          >
            {book.title}
          </h3>
          <p
            className="font-sans text-[0.66rem] italic tracking-[0.08em] uppercase"
            style={{ color: cloth.accent }}
          >
            {book.author}
          </p>
        </div>

        <div
          className="mt-2 flex items-center justify-between text-[0.62rem] font-bold tracking-widest"
          style={{ color: cloth.text }}
        >
          <span>LETRARIA</span>
          <span>{book.year}</span>
        </div>
      </div>

      {soldOut && (
        <span className="absolute right-2 top-6 z-10 -rotate-[8deg] rounded-md border-2 border-danger bg-parchment/92 px-2 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-danger shadow-paper">
          Emprestado
        </span>
      )}
    </div>
  );
}

export function BookFaceBadge({ book }: { book: Book }) {
  if (book.format !== "fisico") {
    return (
      <Badge variant="success" className="normal-case">
        Disponível · {FORMAT_STAMP[book.format]}
      </Badge>
    );
  }
  if (book.availableQuantity <= 0)
    return (
      <Badge variant="danger" className="normal-case">
        Emprestado — sem exemplares
      </Badge>
    );
  if (book.availableQuantity === 1)
    return (
      <Badge variant="gold" className="normal-case">
        Disponível · último exemplar
      </Badge>
    );
  return (
    <Badge variant="success" className="normal-case">
      Disponível · {book.availableQuantity}{" "}
      {book.availableQuantity === 1 ? "exemplar" : "exemplares"}
    </Badge>
  );
}

export function BookFormatBadge({ format }: { format: BookFormat }) {
  return (
    <Badge variant="soft" className="normal-case">
      {FORMAT_ICON[format]}
      {FORMAT_STAMP[format]}
    </Badge>
  );
}