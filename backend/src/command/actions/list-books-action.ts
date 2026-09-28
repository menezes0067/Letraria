import type { IBookDAO } from "../../dao/book-dao-interface.ts";
import type { BookData } from "../../models/book.ts";
import type { ICommand } from "../command.ts";

export class ListBooksAction implements ICommand<void, BookData[]> {
	constructor(private readonly bookDAO: IBookDAO) {}

	execute(_input: void): BookData[] {
		return this.bookDAO.findAll();
	}
}