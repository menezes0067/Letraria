import type { Book, BookFormat, Loan, User, UserProfile } from "../types";

/**
 * Camada de acesso a dados — fala com o backend via HTTP.
 * As assinaturas são estáveis, então os componentes só invocam `api.*`.
 * Em desenvolvimento o Vite faz proxy de `/api` para o servidor (vite.config.ts).
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export interface ActivityEntry {
  id: string;
  action: "cadastro" | "edição" | "exclusão" | "empréstimo" | "devolução";
  detail: string;
  at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Erro ao comunicar com o servidor.");
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function json(method: string, body?: unknown): RequestInit {
  return { method, body: body === undefined ? undefined : JSON.stringify(body) };
}

/* ── Leituras ─────────────────────────────────────────────── */

export async function fetchBooks(): Promise<Book[]> {
  return request<Book[]>("/books");
}

export async function fetchUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

export async function fetchLoans(): Promise<Loan[]> {
  return request<Loan[]>("/loans");
}

export async function fetchActivity(): Promise<ActivityEntry[]> {
  return request<ActivityEntry[]>("/activity");
}

/* ── Livros ───────────────────────────────────────────────── */

export interface BookInput {
  title: string;
  author: string;
  year: number;
  availableQuantity: number;
  format: BookFormat;
}

export async function createBook(input: BookInput): Promise<Book> {
  return request<Book>("/books", json("POST", input));
}

export async function updateBook(id: string, input: BookInput): Promise<Book> {
  return request<Book>(`/books/${id}`, json("PUT", input));
}

export async function removeBook(id: string): Promise<void> {
  return request<void>(`/books/${id}`, json("DELETE"));
}

/* ── Usuários ─────────────────────────────────────────────── */

export interface NewUserInput {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}

export async function createUser(input: NewUserInput): Promise<User> {
  return request<User>("/users", json("POST", input));
}

export async function signIn(email: string, password: string): Promise<User> {
  return request<User>("/auth/login", json("POST", { email, password }));
}

/* ── Empréstimos ──────────────────────────────────────────── */

export interface NewLoanInput {
  bookId: string;
  userId: string;
  loanDate: string;
  expectedReturnDate: string;
}

export async function createLoan(input: NewLoanInput): Promise<Loan> {
  return request<Loan>("/loans", json("POST", input));
}

/** Retirada pelos próprios alunos — regras RF09/RF12/RF14 centralizadas no servidor. */
export async function borrowSelf(userId: string, bookId: string): Promise<Loan> {
  return request<Loan>("/loans/borrow", json("POST", { userId, bookId }));
}

export async function returnLoan(loanId: string, actualDate: string): Promise<Loan> {
  return request<Loan>(`/loans/${loanId}/return`, json("POST", { actualDate }));
}