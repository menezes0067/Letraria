import type { ILoanDAO } from "../../dao/loan-dao-interface.ts";
import { Loan } from "../../models/loan.ts";
import type { ICommand } from "../command.ts";

export class ListLoansAction implements ICommand<void, Loan[]> {
	constructor(private readonly loanDAO: ILoanDAO) {}

	execute(_input: void): Loan[] {
		return this.loanDAO.findAll();
	}
}