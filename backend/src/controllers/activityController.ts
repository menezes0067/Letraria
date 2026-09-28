import type { Request, Response } from "express";

import type { CommandFactory } from "../command/command-factory.ts";
import type { ActivityEntry } from "../models/activity.ts";

export class ActivityController {
	constructor(private readonly factory: CommandFactory) {}

	list = (_req: Request, res: Response): void => {
		res.json(this.factory.execute<void, ActivityEntry[]>("listActivity"));
	};
}