import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import type { ILoanDAO } from "../../dao/loan-dao-interface.ts";
import { NotFoundError, ValidationError } from "../../errors.ts";
import type { ICommand } from "../command.ts";

export class DeleteBookAction implements ICommand<{ id: string }, void> {
	constructor(
		private readonly bookDAO: IBookDAO,
		private readonly loanDAO: ILoanDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute({ id }: { id: string }): void {
		const existing = this.bookDAO.findById(id);
		if (!existing) throw new NotFoundError("Livro não encontrado.");

		if (this.loanDAO.hasActiveByBookId(id))
			throw new ValidationError("Livro com empréstimo em aberto não pode ser excluído.");

		this.bookDAO.deleteById(id);
		this.activityDAO.create({
			action: "exclusão",
			detail: `Livro “${existing.title}” removido da estante`,
			at: new Date().toISOString(),
		});
	}
}