import type { BookFormat } from "../types";

export function formatDateBR(isoDate: string | null): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(expectedReturnDate: string): boolean {
  return new Date(expectedReturnDate).getTime() < Date.now();
}

export const shortId = (id: string): string => id.slice(0, 6).toUpperCase();

/** Cores de "tecido de capa" derivadas de forma estável do título. */
const CLOTH: { bg: string; text: string; accent: string }[] = [
  { bg: "#8c3a22", text: "#f7ecd7", accent: "#d9a441" }, // terracota
  { bg: "#4d5c3b", text: "#eef0e2", accent: "#c1b25f" }, // verde encadernação
  { bg: "#21354b", text: "#e6edf4", accent: "#c89b5a" }, // azul-petróleo
  { bg: "#5a3a2e", text: "#f3e6d3", accent: "#dfb071" }, // marrom caramelo
  { bg: "#6b3c55", text: "#f7e8ec", accent: "#d9a441" }, // vinho
  { bg: "#3d4d5c", text: "#e8eff1", accent: "#caa34f" }, // cinza-azulado
  { bg: "#7c4a1e", text: "#f6ecd8", accent: "#e8c069" }, // mostarda ocre
  { bg: "#293d33", text: "#e8eee4", accent: "#c4a35a" }, // verde-escuro
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function clothFor(title: string): (typeof CLOTH)[number] {
  return CLOTH[hashCode(title.normalize("NFD")) % CLOTH.length];
}

export const FORMAT_STAMP: Record<BookFormat, string> = {
  fisico: "Encadernado",
  ebook: "Digital",
  audiobook: "Em áudio",
};