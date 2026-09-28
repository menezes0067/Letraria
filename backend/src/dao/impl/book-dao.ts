import type { Sqlite } from "../../database/database.ts";
import { type BookData, type BookFormat } from "../../models/book.ts";
import { IBookDAO } from "../book-dao-interface.ts";

interface BookRow {
	id: string;
	format: BookFormat;
	title: string;
	author: string;
	year: number;
	availableQuantity: number;
	createdAt: string;
}

class BookDAO implements IBookDAO {
	constructor(private readonly db: Sqlite) {}

	create(book: BookData): void {
		this.db
			.prepare(
				"INSERT INTO books (id, format, title, author, year, availableQuantity, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				book.id,
				book.format,
				book.title,
				book.author,
				book.year,
				book.availableQuantity,
				book.createdAt,
			);
	}

	findAll(): BookData[] {
		const rows = this.db.prepare("SELECT * FROM books ORDER BY title").all() as BookRow[];
		return rows.map(toData);
	}

	findById(id: string): BookData | null {
		const row = this.db.prepare("SELECT * FROM books WHERE id = ?").get(id) as
			| BookRow
			| undefined;
		return row ? toData(row) : null;
	}

	update(id: string, input: Omit<BookData, "id" | "createdAt">): BookData | null {
		const existing = this.findById(id);
		if (!existing) return null;

		this.db
			.prepare(
				"UPDATE books SET format = ?, title = ?, author = ?, year = ?, availableQuantity = ? WHERE id = ?",
			)
			.run(
				input.format,
				input.title,
				input.author,
				input.year,
				input.availableQuantity,
				id,
			);

		return { ...existing, ...input };
	}

	deleteById(id: string): void {
		this.db.prepare("DELETE FROM books WHERE id = ?").run(id);
	}
}

function toData(row: BookRow): BookData {
	return {
		id: row.id,
		title: row.title,
		author: row.author,
		year: row.year,
		availableQuantity: row.availableQuantity,
		format: row.format,
		createdAt: row.createdAt,
	};
}

export { BookDAO }