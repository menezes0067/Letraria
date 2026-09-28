import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import { NotFoundError } from "../../errors.ts";
import { type BookData } from "../../models/book.ts";
import type { ICommand } from "../command.ts";
import type { CreateBookInput } from "./create-book-action.ts";

export class UpdateBookAction implements ICommand<{ id: string; input: CreateBookInput }, BookData> {
	constructor(
		private readonly bookDAO: IBookDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute({ id, input }: { id: string; input: CreateBookInput }): BookData {
		const existing = this.bookDAO.findById(id);
		if (!existing) throw new NotFoundError("Livro não encontrado.");

		this.bookDAO.update(id, input);
		this.activityDAO.create({
			action: "edição",
			detail: `Livro “${input.title}” atualizado`,
			at: new Date().toISOString(),
		});
		return { ...existing, ...input };
	}
}