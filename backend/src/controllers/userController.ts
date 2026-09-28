import type { Request, Response } from "express";

import type { CreateUserInput } from "../command/actions/create-user-action.ts";
import type { LoginInput } from "../command/actions/authenticate-user-action.ts";
import type { CommandFactory } from "../command/command-factory.ts";
import type { User } from "../models/user.ts";

export class UserController {
	constructor(private readonly factory: CommandFactory) {}

	list = (_req: Request, res: Response): void => {
		res.json(this.factory.execute<void, User[]>("listUsers"));
	};

	create = (req: Request, res: Response): void => {
		const user = this.factory.execute<CreateUserInput, User>(
			"createUser",
			req.body as CreateUserInput,
		);
		res.status(201).json(user);
	};

	login = (req: Request, res: Response): void => {
		const user = this.factory.execute<LoginInput, User>("authenticateUser", req.body as LoginInput);
		res.json(user);
	};
}