import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";

import { ActivityDAO } from "../dao/impl/activity-dao.ts";
import { BookDAO } from "../dao/impl/book-dao.ts";
import { LoanDAO } from "../dao/impl/loan-dao.ts";
import { UserDAO } from "../dao/impl/user-dao.ts";

import { AuthenticateUserAction } from "../command/actions/authenticate-user-action.ts";
import { BorrowBookAction } from "../command/actions/borrow-book-action.ts";
import { CreateBookAction } from "../command/actions/create-book-action.ts";
import { CreateLoanAction } from "../command/actions/create-loan-action.ts";
import { CreateUserAction } from "../command/actions/create-user-action.ts";
import { DeleteBookAction } from "../command/actions/delete-book-action.ts";
import { ListActivityAction } from "../command/actions/list-activity-action.ts";
import { ListBooksAction } from "../command/actions/list-books-action.ts";
import { ListLoansAction } from "../command/actions/list-loans-action.ts";
import { ListUsersAction } from "../command/actions/list-users-action.ts";
import { ReturnLoanAction } from "../command/actions/return-loan-action.ts";
import { UpdateBookAction } from "../command/actions/update-book-action.ts";
import { CommandFactory } from "../command/command-factory.ts";

import { ActivityController } from "../controllers/activityController.ts";
import { BookController } from "../controllers/bookController.ts";
import { LoanController } from "../controllers/loanController.ts";
import { UserController } from "../controllers/userController.ts";

import defaultDb from "../database/database.ts";
import { AppError } from "../errors.ts";

import { createActivityRoutes } from "../routes/activity-routes.ts";
import { createBookRoutes } from "../routes/book-routes.ts";
import { createLoanRoutes } from "../routes/loan-routes.ts";
import { createUserRoutes } from "../routes/user-routes.ts";

export function createApp(db = defaultDb): Express {
	const app = express();

	app.use(cors());
	app.use(express.json());

	/* ── DAOs ─────────────────────────────────────────────────── */

	const userDAO = new UserDAO(db);
	const bookDAO = new BookDAO(db);
	const loanDAO = new LoanDAO(db);
	const activityDAO = new ActivityDAO(db);

	/* ── CommandFactory (Factory Method) ──────────────────────── */

	const commandFactory = new CommandFactory({
		listBooks: new ListBooksAction(bookDAO),
		createBook: new CreateBookAction(bookDAO, activityDAO),
		updateBook: new UpdateBookAction(bookDAO, activityDAO),
		deleteBook: new DeleteBookAction(bookDAO, loanDAO, activityDAO),
		listUsers: new ListUsersAction(userDAO),
		createUser: new CreateUserAction(userDAO, activityDAO),
		authenticateUser: new AuthenticateUserAction(userDAO),
		listLoans: new ListLoansAction(loanDAO),
		createLoan: new CreateLoanAction(bookDAO, loanDAO, activityDAO),
		borrowBook: new BorrowBookAction(bookDAO, loanDAO, activityDAO),
		returnLoan: new ReturnLoanAction(bookDAO, loanDAO, activityDAO),
		listActivity: new ListActivityAction(activityDAO),
	});

	/* ── Controllers ──────────────────────────────────────────── */

	const userController = new UserController(commandFactory);
	const bookController = new BookController(commandFactory);
	const loanController = new LoanController(commandFactory);
	const activityController = new ActivityController(commandFactory);

	/* ── Rotas ────────────────────────────────────────────────── */

	app.use("/api", createUserRoutes(userController));
	app.use("/api", createBookRoutes(bookController));
	app.use("/api", createLoanRoutes(loanController));
	app.use("/api", createActivityRoutes(activityController));

	app.get("/", (_req, res) => {
		res.json({ message: "API funcionando" });
	});

	app.use((_req, res) => {
		res.status(404).json({ error: "Rota não encontrada." });
	});

	app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
		if (err instanceof AppError) {
			res.status(err.statusCode).json({ error: err.message });
			return;
		}

		const status = (err as { status?: number }).status;
		if (typeof status === "number" && status >= 400 && status < 500) {
			res.status(status).json({ error: "Requisição inválida." });
			return;
		}

		console.error(err);
		res.status(500).json({ error: "Erro interno do servidor." });
	});

	return app;
}