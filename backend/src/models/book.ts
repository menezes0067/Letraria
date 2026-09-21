import { Ilendable } from "../interfaces/Ilendable.ts"

abstract class Book implements Ilendable{
	constructor(
		protected id: string,
		protected title: string,
		protected author: string,
		protected year: number,
		protected avaibleQuantity: number 
	) {}


	abstract calculateDueDateInDays(): number;

	abstract calculateFine(overdueDays: number): number;

	abstract getType(): string;
}

export { Book } 
