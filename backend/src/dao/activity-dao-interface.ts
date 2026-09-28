import type { ActivityEntry } from "../models/activity.ts";

export interface IActivityDAO {
	create(entry: Omit<ActivityEntry, "id">): void;
	findRecent(limit: number): ActivityEntry[];
}