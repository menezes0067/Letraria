import { randomUUID } from "node:crypto";

import { User, type UserProfile } from "../models/user.ts";

export class UserBuilder {
	private _id?: string;
	private _name = "";
	private _email = "";
	private _password = "";
	private _profile?: UserProfile;
	private _createdAt?: string;

	withId(id: string): this {
		this._id = id;
		return this;
	}

	withName(name: string): this {
		this._name = name;
		return this;
	}

	withEmail(email: string): this {
		this._email = email;
		return this;
	}

	withPassword(password: string): this {
		this._password = password;
		return this;
	}

	withProfile(profile: UserProfile): this {
		this._profile = profile;
		return this;
	}

	withCreatedAt(createdAt: string): this {
		this._createdAt = createdAt;
		return this;
	}

	build(): User {
		if (!this._profile) throw new Error("Perfil não definido antes do build.");
		return new User(
			this._id ?? randomUUID(),
			this._name.trim(),
			this._email.trim().toLowerCase(),
			this._password,
			this._profile,
			this._createdAt ?? new Date().toISOString(),
		);
	}
}