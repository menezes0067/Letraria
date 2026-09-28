import { Book } from "./book.ts";

class Fisic extends Book {
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
		return 14;
	}

	calculateFine(overduedays: number): number {
		if (overduedays <= 0) return 0;
		const finePerDay = 1.5    
		return overduedays * finePerDay
	}

	getType(): string {
		return "fisico"    
	}
}	

export { Fisic }