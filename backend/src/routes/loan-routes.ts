import { Router } from "express";

import type { LoanController } from "../controllers/loanController.ts";

export function createLoanRoutes(controller: LoanController): Router {
	const router = Router();

	router.get("/loans", controller.list);
	router.post("/loans", controller.create);
	router.post("/loans/borrow", controller.borrowSelf);
	router.post("/loans/:id/return", controller.returnLoan);

	return router;
}