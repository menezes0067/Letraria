import { randomUUID } from "node:crypto";

import { BookBuilder } from "../../builders/bookBuilder.ts";
import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import type { ILoanDAO } from "../../dao/loan-dao-interface.ts";
import { NotFoundError, ValidationError } from "../../errors.ts";
import { Loan } from "../../models/loan.ts";
import { addDays } from "../../utils/date.ts";
import type { ICommand } from "../command.ts";

export class BorrowBookAction implements ICommand<{ userId: string; bookId: string }, Loan> {
	constructor(
		private readonly bookDAO: IBookDAO,
		private readonly loanDAO: ILoanDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute({ userId, bookId }: { userId: string; bookId: string }): Loan {
		const data = this.bookDAO.findById(bookId);
		if (!data) throw new NotFoundError("Livro não encontrado.");

		if (data.format === "fisico" && data.availableQuantity <= 0)
			throw new ValidationError("Este livro está sem exemplares disponíveis no momento."); // RF12

		if (this.loanDAO.hasOverdueByUserId(userId))
			throw new ValidationError("Você possui empréstimo em atraso e não pode retirar novos livros."); // RF14

		if (this.loanDAO.hasActiveByUserAndBook(userId, bookId))
			throw new ValidationError("Você já está com este título retirado.");

		const book = BookBuilder.fromData(data).build();
		const now = new Date().toISOString();
		const start = now.slice(0, 10);
		const loan = new Loan(
			randomUUID(),
			book.id,
			userId,
			start,
			addDays(start, book.calculateDueDateInDays()),
			null,
			0,
			now,
			now,
		);

		this.loanDAO.create(loan);
		if (data.format === "fisico")
			this.bookDAO.update(data.id, {
				title: data.title,
				author: data.author,
				year: data.year,
				format: data.format,
				availableQuantity: data.availableQuantity - 1,
			});

		this.activityDAO.create({
			action: "empréstimo",
			detail: `Retirada ${loan.id} · ${data.title}`,
			at: loan.createdAt,
		});
		return loan;
	}
}