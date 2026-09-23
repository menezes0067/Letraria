export type BookFormat = "fisico" | "ebook" | "audiobook";
export type UserProfile = "aluno" | "bibliotecario";

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  availableQuantity: number;
  format: BookFormat;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
  createdAt: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  fine: number;
  createdAt: string;
  updatedAt: string;
}

export const FORMAT_LABEL: Record<BookFormat, string> = {
  fisico: "Físico",
  ebook: "E-book",
  audiobook: "Audiobook",
};

/**
 * Regras por tipo (RF09 prazos distintos; RF11 multa apenas para físicos).
 */
export const FORMAT_SETTINGS: Record<
  BookFormat,
  { dueDays: number; finePerDay: number; hasStock: boolean }
> = {
  fisico: { dueDays: 14, finePerDay: 1.5, hasStock: true },
  ebook: { dueDays: 21, finePerDay: 0, hasStock: false },
  audiobook: { dueDays: 7, finePerDay: 0, hasStock: false },
};

export const PROFILE_LABEL: Record<UserProfile, string> = {
  bibliotecario: "Bibliotecário",
  aluno: "Aluno",
};

/** Disponibilidade (RF04/RF12): estoque existe apenas para físicos. */
export function isBookAvailable(book: Book): boolean {
  if (book.format === "fisico") return book.availableQuantity > 0;
  return true;
}

export function computeFine(
  format: BookFormat,
  expectedReturnDate: string,
  actualReturnDate: string,
): number {
  const expected = new Date(expectedReturnDate);
  const actual = new Date(actualReturnDate);
  const overdueMs = actual.getTime() - expected.getTime();
  const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
  if (overdueDays <= 0) return 0;
  return Number((overdueDays * FORMAT_SETTINGS[format].finePerDay).toFixed(2));
}