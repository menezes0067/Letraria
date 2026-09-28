import { NotFoundError } from "../errors.ts";
import type { ICommand } from "./command.ts";

export class CommandFactory {
	constructor(private readonly registry: Record<string, ICommand>) {}

	create(action: string): ICommand {
		const command = this.registry[action];
		if (!command) throw new NotFoundError(`Ação desconhecida: "${action}"`);
		return command;
	}

	execute<Input = unknown, Output = unknown>(action: string, input?: Input): Output {
		return this.create(action).execute(input as Input) as Output;
	}
}