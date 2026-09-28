export type UserProfile = "aluno" | "bibliotecario";

export const PROFILE_LABEL: Record<UserProfile, string> = {
	aluno: "Aluno",
	bibliotecario: "Bibliotecário",
};

export class User {
	constructor(
		readonly id: string,
		readonly name: string,
		readonly email: string,
		readonly password: string,
		readonly profile: UserProfile,
		readonly createdAt: string,
	) {}
}