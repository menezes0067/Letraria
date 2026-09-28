import { BookBuilder } from "../../builders/bookBuilder.ts";
import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import type { ILoanDAO } from "../../dao/loan-dao-interface.ts";
import { NotFoundError } from "../../errors.ts";
import { Loan } from "../../models/loan.ts";
import { overdueDaysBetween } from "../../utils/date.ts";
import type { ICommand } from "../command.ts";

export class ReturnLoanAction implements ICommand<{ loanId: string; actualDate: string }, Loan> {
	constructor(
		private readonly bookDAO: IBookDAO,
		private readonly loanDAO: ILoanDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute({ loanId, actualDate }: { loanId: string; actualDate: string }): Loan {
		const loan = this.loanDAO.findById(loanId);
		if (!loan) throw new NotFoundError("Empréstimo não encontrado.");

		const data = this.bookDAO.findById(loan.bookId);

		let fine = 0;
		if (data) {
			const book = BookBuilder.fromData(data).build();
			fine = book.calculateFine(overdueDaysBetween(loan.expectedReturnDate, actualDate));
		}

		const updated = this.loanDAO.markReturned(loanId, actualDate, fine);
		if (!updated) throw new NotFoundError("Empréstimo não encontrado.");

		if (data?.format === "fisico")
			this.bookDAO.update(data.id, {
				title: data.title,
				author: data.author,
				year: data.year,
				format: data.format,
				availableQuantity: data.availableQuantity + 1,
			});

		this.activityDAO.create({
			action: "devolução",
			detail: `Ficha ${loanId} · ${data?.title ?? ""}${fineLabel(fine)}`,
			at: updated.updatedAt,
		});
		return updated;
	}
}

function fineLabel(fine: number): string {
	return fine > 0 ? ` · multa R$ ${fine.toFixed(2).replace(".", ",")}` : "";
}