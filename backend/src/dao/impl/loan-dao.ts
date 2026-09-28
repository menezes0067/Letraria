import type { Sqlite } from "../../database/database.ts";
import { Loan } from "../../models/loan.ts";
import { ILoanDAO } from "../loan-dao-interface.ts";

interface LoanRow {
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

class LoanDAO implements ILoanDAO {
	constructor(private readonly db: Sqlite) {}

	create(loan: Loan): void {
		this.db
			.prepare(
				"INSERT INTO loans (id, bookId, userId, loanDate, expectedReturnDate, actualReturnDate, fine, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				loan.id,
				loan.bookId,
				loan.userId,
				loan.loanDate,
				loan.expectedReturnDate,
				loan.actualReturnDate,
				loan.fine,
				loan.createdAt,
				loan.updatedAt,
			);
	}

	findAll(): Loan[] {
		const rows = this.db.prepare("SELECT * FROM loans ORDER BY createdAt DESC").all() as LoanRow[];
		return rows.map(toEntity);
	}

	findById(id: string): Loan | null {
		const row = this.db.prepare("SELECT * FROM loans WHERE id = ?").get(id) as
			| LoanRow
			| undefined;
		return row ? toEntity(row) : null;
	}

	hasActiveByBookId(bookId: string): boolean {
		const row = this.db
			.prepare("SELECT id FROM loans WHERE bookId = ? AND actualReturnDate IS NULL LIMIT 1")
			.get(bookId);
		return row !== undefined;
	}

	hasActiveByUserAndBook(userId: string, bookId: string): boolean {
		const row = this.db
			.prepare(
				"SELECT id FROM loans WHERE userId = ? AND bookId = ? AND actualReturnDate IS NULL LIMIT 1",
			)
			.get(userId, bookId);
		return row !== undefined;
	}

	hasOverdueByUserId(userId: string): boolean {
		const row = this.db
			.prepare(
				"SELECT id FROM loans WHERE userId = ? AND actualReturnDate IS NULL AND date(expectedReturnDate) < date('now') LIMIT 1",
			)
			.get(userId);
		return row !== undefined;
	}

	markReturned(id: string, actualReturnDate: string, fine: number): Loan | null {
		this.db
			.prepare("UPDATE loans SET actualReturnDate = ?, fine = ?, updatedAt = ? WHERE id = ?")
			.run(actualReturnDate, fine, new Date().toISOString(), id);
		return this.findById(id);
	}
}

function toEntity(row: LoanRow): Loan {
	return new Loan(
		row.id,
		row.bookId,
		row.userId,
		row.loanDate,
		row.expectedReturnDate,
		row.actualReturnDate,
		row.fine,
		row.createdAt,
		row.updatedAt,
	);
}

export { LoanDAO }