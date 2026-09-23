import { addDays, isOverdue } from "../lib/dates";
import { mockActivity, mockBooks, mockLoans, mockUsers } from "./mock-data";
import type { Book, BookFormat, Loan, User, UserProfile } from "../types";
import { computeFine, FORMAT_SETTINGS, isBookAvailable, PROFILE_LABEL } from "../types";

/**
 * Camada de acesso a dados.
 * Simula a API em memória (mesmas assinaturas que o backend terá),
 * para o visual funcionar de forma autônoma — depois basta trocar
 * o corpo destas funções por chamadas `fetch`.
 */

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

let books: Book[] = [...mockBooks];
let users: User[] = [...mockUsers];
let loans: Loan[] = [...mockLoans];

/* ── Auditoria (RF15) ─────────────────────────────────────── */

export interface ActivityEntry {
  id: string;
  action: "cadastro" | "edição" | "exclusão" | "empréstimo" | "devolução";
  detail: string;
  at: string;
}

let activity: ActivityEntry[] = [...mockActivity];

function record(action: ActivityEntry["action"], detail: string) {
  activity = [
    {
      id: `a-${Date.now().toString(36)}`,
      action,
      detail,
      at: new Date().toISOString(),
    },
    ...activity,
  ].slice(0, 60);
}

export async function fetchActivity(): Promise<ActivityEntry[]> {
  await delay(120);
  return [...activity];
}

/* ── Leituras ─────────────────────────────────────────────── */

export async function fetchBooks(): Promise<Book[]> {
  await delay();
  return [...books];
}

export async function fetchUsers(): Promise<User[]> {
  await delay();
  return [...users];
}

export async function fetchLoans(): Promise<Loan[]> {
  await delay();
  return [...loans];
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
  await delay();
  const now = new Date().toISOString();
  const book: Book = { id: `b-${Date.now().toString(36)}`, ...input, createdAt: now };
  books = [book, ...books];
  record("cadastro", `Livro “${book.title}” (${book.format})`);
  return book;
}

export async function updateBook(id: string, input: BookInput): Promise<Book> {
  await delay();
  const existing = books.find((b) => b.id === id);
  if (!existing) throw new Error("Livro não encontrado.");
  const updated: Book = { ...existing, ...input };
  books = books.map((b) => (b.id === id ? updated : b));
  record("edição", `Livro “${updated.title}” atualizado`);
  return updated;
}

export async function removeBook(id: string): Promise<void> {
  await delay();
  const existing = books.find((b) => b.id === id);
  const inUse = loans.some((l) => l.bookId === id && l.actualReturnDate === null);
  if (inUse) throw new Error("Livro com empréstimo em aberto não pode ser excluído.");
  books = books.filter((b) => b.id !== id);
  if (existing) record("exclusão", `Livro “${existing.title}” removido da estante`);
}

/* ── Usuários ─────────────────────────────────────────────── */

export interface NewUserInput {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}

export async function createUser(input: NewUserInput): Promise<User> {
  await delay();
  if (users.some((u) => u.email === input.email))
    throw new Error("Já existe uma carteirinha com este e-mail.");
  const now = new Date().toISOString();
  const user: User = {
    id: `u-${Date.now().toString(36)}`,
    ...input,
    createdAt: now,
  };
  users = [...users, user];
  record("cadastro", `${PROFILE_LABEL[user.profile]} ${user.name}`);
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  await delay(400);
  const found = users.find((u) => u.email === email && u.password === password);
  if (!found) throw new Error("E-mail ou senha não conferem.");
  return found;
}

/* ── Empréstimos ──────────────────────────────────────────── */

export interface NewLoanInput {
  bookId: string;
  userId: string;
  loanDate: string;
  expectedReturnDate: string;
}

function userHasOverdueLoan(userId: string): boolean {
  return loans.some(
    (l) => l.userId === userId && l.actualReturnDate === null && isOverdue(l.expectedReturnDate),
  );
}

export async function createLoan(input: NewLoanInput): Promise<Loan> {
  await delay();
  const book = books.find((b) => b.id === input.bookId);
  if (!book) throw new Error("Livro não encontrado.");
  if (!isBookAvailable(book))
    throw new Error("Este livro físico está sem exemplares disponíveis."); // RF12
  if (userHasOverdueLoan(input.userId))
    throw new Error("Usuário com empréstimo em atraso não pode retirar novos livros."); // RF14

  const now = new Date().toISOString();
  const loan: Loan = {
    id: `e-${Math.floor(1000 + Math.random() * 9000)}`,
    bookId: input.bookId,
    userId: input.userId,
    loanDate: input.loanDate,
    expectedReturnDate: input.expectedReturnDate,
    actualReturnDate: null,
    fine: 0,
    createdAt: now,
    updatedAt: now,
  };
  loans = [loan, ...loans];
  if (book.format === "fisico") {
    books = books.map((b) =>
      b.id === input.bookId ? { ...b, availableQuantity: b.availableQuantity - 1 } : b,
    );
  }
  record("empréstimo", `Ficha ${loan.id} · ${book.title}`);
  return loan;
}

/** Retirada pelos próprios alunos — regras RF09/RF12/RF14 centralizadas. */
export async function borrowSelf(userId: string, bookId: string): Promise<Loan> {
  await delay();
  const book = books.find((b) => b.id === bookId);
  if (!book) throw new Error("Livro não encontrado.");
  if (!isBookAvailable(book))
    throw new Error("Este livro está sem exemplares disponíveis no momento."); // RF12
  if (userHasOverdueLoan(userId))
    throw new Error("Você possui empréstimo em atraso e não pode retirar novos livros."); // RF14
  const alreadyActive = loans.some(
    (l) => l.bookId === bookId && l.userId === userId && l.actualReturnDate === null,
  );
  if (alreadyActive) throw new Error("Você já está com este título retirado.");

  const loanDate = new Date().toISOString().slice(0, 10);
  const expectedReturnDate = addDays(loanDate, FORMAT_SETTINGS[book.format].dueDays); // RF09
  const now = new Date().toISOString();
  const loan: Loan = {
    id: `e-${Math.floor(1000 + Math.random() * 9000)}`,
    bookId,
    userId,
    loanDate,
    expectedReturnDate,
    actualReturnDate: null,
    fine: 0,
    createdAt: now,
    updatedAt: now,
  };
  loans = [loan, ...loans];
  if (book.format === "fisico") {
    books = books.map((b) =>
      b.id === bookId ? { ...b, availableQuantity: b.availableQuantity - 1 } : b,
    );
  }
  record("empréstimo", `Retirada ${loan.id} · ${book.title}`);
  return loan;
}

export async function returnLoan(loanId: string, actualDate: string): Promise<Loan> {
  await delay();
  let updated: Loan | undefined;
  loans = loans.map((l) => {
    if (l.id !== loanId) return l;
    const book = books.find((b) => b.id === l.bookId);
    const fine = book ? computeFine(book.format, l.expectedReturnDate, actualDate) : 0;
    updated = { ...l, actualReturnDate: actualDate, fine, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (!updated) throw new Error("Empréstimo não encontrado.");
  const returnedBookId = updated.bookId;
  const returnedId = updated.id;
  const returnedFine = updated.fine;
  const book = books.find((b) => b.id === returnedBookId);
  if (book?.format === "fisico") {
    books = books.map((b) =>
      b.id === returnedBookId ? { ...b, availableQuantity: b.availableQuantity + 1 } : b,
    );
  }
  record("devolução", `Ficha ${returnedId} · ${book?.title ?? ""}${fineLabel(returnedFine)}`);
  return updated;
}

function fineLabel(fine: number): string {
  return fine > 0 ? ` · multa R$ ${fine.toFixed(2).replace(".", ",")}` : "";
}