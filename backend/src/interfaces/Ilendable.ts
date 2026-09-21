interface Ilendable{
	calculateDueDateInDays(): number,
	calculateFine(overdueDays: number): number,
	getType(): string 
}

export { Ilendable }
