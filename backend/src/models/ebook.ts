import { Book } from "./book.ts";

class Ebook extends Book {
	constructor(
		id: string,
		title: string,
		author: string,
		year: number,
		availableQuantity: number = 1,
		format?: string,
		createdAt?: string,
	) {
		super(id, title, author, year, availableQuantity, format, createdAt);
	}

	calculateDueDateInDays(): number {
		return 21;
	}

	calculateFine(_overduedays: number): number {
		return 0;
	}

	getType(): string {
		return "ebook"    
	}
}

export { Ebook }