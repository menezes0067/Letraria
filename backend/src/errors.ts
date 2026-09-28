export class AppError extends Error {
	constructor(
		readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(400, message);
	}
}

export class EmailAlreadyInUseError extends AppError {
	constructor() {
		super(409, "Já existe uma carteirinha com este e-mail.");
	}
}

export class InvalidCredentialsError extends AppError {
	constructor() {
		super(401, "E-mail ou senha não conferem.");
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(404, message);
	}
}