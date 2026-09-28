import { Router } from "express";

import type { ActivityController } from "../controllers/activityController.ts";

export function createActivityRoutes(controller: ActivityController): Router {
	const router = Router();

	router.get("/activity", controller.list);

	return router;
}