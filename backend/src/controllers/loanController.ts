import type { Request, Response } from "express";

import type { CreateLoanInput } from "../command/actions/create-loan-action.ts";
import type { CommandFactory } from "../command/command-factory.ts";
import type { Loan } from "../models/loan.ts";

export class LoanController {
	constructor(private readonly factory: CommandFactory) {}

	list = (_req: Request, res: Response): void => {
		res.json(this.factory.execute<void, Loan[]>("listLoans"));
	};

	create = (req: Request, res: Response): void => {
		const loan = this.factory.execute<CreateLoanInput, Loan>(
			"createLoan",
			req.body as CreateLoanInput,
		);
		res.status(201).json(loan);
	};

	borrowSelf = (req: Request, res: Response): void => {
		const { userId, bookId } = req.body as { userId?: string; bookId?: string };
		const loan = this.factory.execute<{ userId: string; bookId: string }, Loan>(
			"borrowBook",
			{ userId: userId ?? "", bookId: bookId ?? "" },
		);
		res.status(201).json(loan);
	};

	returnLoan = (req: Request, res: Response): void => {
		const { id } = req.params as { id: string };
		const { actualDate } = req.body as { actualDate?: string };
		const loan = this.factory.execute<{ loanId: string; actualDate: string }, Loan>(
			"returnLoan",
			{ loanId: id, actualDate: actualDate ?? "" },
		);
		res.json(loan);
	};
}