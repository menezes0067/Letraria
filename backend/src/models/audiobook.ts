import { Book } from "./book.ts";

class Audiobook extends Book {
	constructor(id: string, 
		    title: string, 
		    author: string, 
		    year: number, 
		    availableQuantity: number) {
		super(id, title, author, year, availableQuantity);
	}

	calculateduedateindays(): number {
		return 7;
	}

	//calculatefine(overduedays: number): number {
	    
	//}

	//gettype(): string {
	    
	//}
}

export { Audiobook }
