import { randomUUID } from "node:crypto";

import type { Sqlite } from "../../database/database.ts";
import { ActivityEntry } from "../../models/activity.ts";
import { IActivityDAO } from "../activity-dao-interface.ts";

interface ActivityRow {
	id: string;
	action: string;
	detail: string;
	at: string;
}

class ActivityDAO implements IActivityDAO {
	constructor(private readonly db: Sqlite) {}

	create(entry: Omit<ActivityEntry, "id">): void {
		this.db
			.prepare("INSERT INTO activity (id, action, detail, at) VALUES (?, ?, ?, ?)")
			.run(randomUUID(), entry.action, entry.detail, entry.at);
	}

	findRecent(limit: number): ActivityEntry[] {
		const rows = this.db
			.prepare("SELECT * FROM activity ORDER BY at DESC, id DESC LIMIT ?")
			.all(limit) as ActivityRow[];
		return rows.map((row) => ({ id: row.id, action: row.action, detail: row.detail, at: row.at }));
	}
}

export { ActivityDAO }