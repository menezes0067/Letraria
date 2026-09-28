import { BookBuilder } from "../../builders/bookBuilder.ts";
import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import { ValidationError } from "../../errors.ts";
import type { BookData, BookFormat } from "../../models/book.ts";
import type { ICommand } from "../command.ts";

export interface CreateBookInput {
	title: string;
	author: string;
	year: number;
	availableQuantity: number;
	format: BookFormat;
}

export class CreateBookAction implements ICommand<CreateBookInput, BookData> {
	constructor(
		private readonly bookDAO: IBookDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute(input: CreateBookInput): BookData {
		this.validate(input);
		const book = this.build(input);
		this.bookDAO.create(book.toData());
		this.activityDAO.create({
			action: "cadastro",
			detail: `Livro “${book.titulo}” (${book.getType()})`,
			at: new Date().toISOString(),
		});
		return book.toData();
	}

	private build(input: CreateBookInput) {
		return new BookBuilder()
			.withTitle(input.title)
			.withAuthor(input.author)
			.withYear(input.year)
			.withAvailableQuantity(input.availableQuantity)
			.withFormat(input.format)
			.build();
	}

	private validate(input: CreateBookInput): void {
		if (!input.title?.trim()) throw new ValidationError("Título é obrigatório");
		if (!input.author?.trim()) throw new ValidationError("Autor é obrigatório");
		if (!input.year || input.year < 0 || input.year > new Date().getFullYear())
			throw new ValidationError("Ano inválido");
		if (input.availableQuantity < 0)
			throw new ValidationError("Quantidade disponível não pode ser negativa");
		if (input.format !== "fisico" && input.format !== "ebook" && input.format !== "audiobook")
			throw new ValidationError("Formato inválido");
	}
}