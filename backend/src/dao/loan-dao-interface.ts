import type { Loan } from "../models/loan.ts";

export interface ILoanDAO {
	create(loan: Loan): void;
	findAll(): Loan[];
	findById(id: string): Loan | null;
	hasActiveByBookId(bookId: string): boolean;
	hasActiveByUserAndBook(userId: string, bookId: string): boolean;
	hasOverdueByUserId(userId: string): boolean;
	markReturned(id: string, actualReturnDate: string, fine: number): Loan | null;
}