import type { IActivityDAO } from "../../dao/activity-dao-interface.ts";
import { ActivityEntry } from "../../models/activity.ts";
import type { ICommand } from "../command.ts";

export class ListActivityAction implements ICommand<void, ActivityEntry[]> {
	constructor(private readonly activityDAO: IActivityDAO) {}

	execute(_input: void): ActivityEntry[] {
		return this.activityDAO.findRecent(60);
	}
}