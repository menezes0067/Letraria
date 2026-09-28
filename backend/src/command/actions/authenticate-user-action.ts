import type { IUserDAO } from "../../dao/user-dao-interface.ts";
import { InvalidCredentialsError } from "../../errors.ts";
import { User } from "../../models/user.ts";
import type { ICommand } from "../command.ts";

export interface LoginInput {
	email: string;
	password: string;
}

export class AuthenticateUserAction implements ICommand<LoginInput, User> {
	constructor(private readonly userDAO: IUserDAO) {}

	execute(input: LoginInput): User {
		const user = this.userDAO.findByEmail(input.email?.trim().toLowerCase() ?? "");
		if (!user || user.password !== input.password) throw new InvalidCredentialsError();
		return user;
	}
}