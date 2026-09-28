import type { Request, Response } from "express";

import type { CreateBookInput } from "../command/actions/create-book-action.ts";
import type { CommandFactory } from "../command/command-factory.ts";
import type { BookData } from "../models/book.ts";

export class BookController {
	constructor(private readonly factory: CommandFactory) {}

	list = (_req: Request, res: Response): void => {
		res.json(this.factory.execute<void, BookData[]>("listBooks"));
	};

	create = (req: Request, res: Response): void => {
		const book = this.factory.execute<CreateBookInput, BookData>(
			"createBook",
			req.body as CreateBookInput,
		);
		res.status(201).json(book);
	};

	update = (req: Request, res: Response): void => {
		const { id } = req.params as { id: string };
		const book = this.factory.execute<{ id: string; input: CreateBookInput }, BookData>(
			"updateBook",
			{ id, input: req.body as CreateBookInput },
		);
		res.json(book);
	};

	remove = (req: Request, res: Response): void => {
		const { id } = req.params as { id: string };
		this.factory.execute<{ id: string }, void>("deleteBook", { id });
		res.status(204).end();
	};
}