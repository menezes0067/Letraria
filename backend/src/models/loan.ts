export class Loan {
	constructor(
		readonly id: string,
		readonly bookId: string,
		readonly userId: string,
		readonly loanDate: string,
		readonly expectedReturnDate: string,
		readonly actualReturnDate: string | null,
		readonly fine: number,
		readonly createdAt: string,
		readonly updatedAt: string,
	) {}

	isOpen(): boolean {
		return this.actualReturnDate === null;
	}
}