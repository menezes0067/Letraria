import type { IUserDAO } from "../../dao/user-dao-interface.ts";
import { User } from "../../models/user.ts";
import type { ICommand } from "../command.ts";

export class ListUsersAction implements ICommand<void, User[]> {
	constructor(private readonly userDAO: IUserDAO) {}

	execute(_input: void): User[] {
		return this.userDAO.findAll();
	}
}