import type { Sqlite } from "../../database/database.ts";
import { User } from "../../models/user.ts";
import { IUserDAO } from "../user-dao-interface.ts";

class UserDAO implements IUserDAO {
	constructor(private readonly db: Sqlite) {}

	create(data: User): void {
		this.db
			.prepare(
				"INSERT INTO users (id, name, email, password, profile, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
			)
			.run(data.id, data.name, data.email, data.password, data.profile, data.createdAt);
	}

	findById(id: string): User | null {
		const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
		return row ?? null;
	}

	findByEmail(email: string): User | null {
		const row = this.db
			.prepare("SELECT * FROM users WHERE email = ?")
			.get(email) as User | undefined;
		return row ?? null;
	}

	findAll(): User[] {
		return this.db.prepare("SELECT * FROM users").all() as User[];
	}
}

export { UserDAO }