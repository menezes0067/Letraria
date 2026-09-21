interface Loan {
	id: string,
	bookid: string,
	userid: string,
	loandate: string,
	expectedreturndate: string,
	actualreturndate: string,
	fine: number
}

export { Loan }
