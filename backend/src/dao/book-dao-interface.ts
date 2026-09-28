import type { BookData } from "../models/book.ts";

export interface IBookDAO {
	create(book: BookData): void;
	findAll(): BookData[];
	findById(id: string): BookData | null;
	update(id: string, input: Omit<BookData, "id" | "createdAt">): BookData | null;
	deleteById(id: string): void;
}