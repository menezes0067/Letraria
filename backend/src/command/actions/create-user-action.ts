import { UserBuilder } from "../../builders/userBuilder.ts";
import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import type { IUserDAO } from "../../dao/user-dao-interface.ts";
import { EmailAlreadyInUseError, ValidationError } from "../../errors.ts";
import { PROFILE_LABEL, User, type UserProfile } from "../../models/user.ts";
import type { ICommand } from "../command.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CreateUserInput {
	name: string;
	email: string;
	password: string;
	profile: UserProfile;
}

export class CreateUserAction implements ICommand<CreateUserInput, User> {
	constructor(
		private readonly userDAO: IUserDAO,
		private readonly activityDAO: IActivityDAO,
	) {}

	execute(input: CreateUserInput): User {
		this.validate(input);

		const user = new UserBuilder()
			.withName(input.name)
			.withEmail(input.email)
			.withPassword(input.password)
			.withProfile(input.profile)
			.build();

		const alreadyRegistered = this.userDAO.findByEmail(user.email) !== null;
		if (alreadyRegistered) throw new EmailAlreadyInUseError();

		this.userDAO.create(user);
		this.activityDAO.create({
			action: "cadastro",
			detail: `${PROFILE_LABEL[user.profile]} ${user.name}`,
			at: new Date().toISOString(),
		});
		return user;
	}

	private validate(input: CreateUserInput): void {
		if (!input.name?.trim()) throw new ValidationError("Informe o nome do usuário.");
		if (!EMAIL_PATTERN.test(input.email ?? "")) throw new ValidationError("E-mail inválido.");
		if (!input.password) throw new ValidationError("Informe a senha.");
		if (input.profile !== "aluno" && input.profile !== "bibliotecario")
			throw new ValidationError("Perfil inválido.");
	}
}