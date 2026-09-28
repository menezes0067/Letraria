import { randomUUID } from "node:crypto";

import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import type { ILoanDAO } from "../../dao/loan-dao-interface.ts";
import { NotFoundError, ValidationError } from "../../errors.ts";
import { Loan } from "../../models/loan.ts";
import type { ICommand } from "../command.ts";

export interface CreateLoanInput {
	bookId: string;
	userId: string;
	loanDate: string;
	expectedReturnDate: string;
}

export class CreateLoanAction implements ICommand<CreateLoanInput, Loan> {
	constructor(
		private readonly bookDAO: IBookDAO,
		private readonly loanDAO: ILoanDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute(input: CreateLoanInput): Loan {
		const data = this.bookDAO.findById(input.bookId);
		if (!data) throw new NotFoundError("Livro não encontrado.");

		if (data.format === "fisico" && data.availableQuantity <= 0)
			throw new ValidationError("Este livro físico está sem exemplares disponíveis."); // RF12

		if (this.loanDAO.hasOverdueByUserId(input.userId))
			throw new ValidationError(
				"Usuário com empréstimo em atraso não pode retirar novos livros.",
			);

		const now = new Date().toISOString();
		const loan = new Loan(
			randomUUID(),
			input.bookId,
			input.userId,
			input.loanDate,
			input.expectedReturnDate,
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
			detail: `Ficha ${loan.id} · ${data.title}`,
			at: now,
		});
		return loan;
	}
}