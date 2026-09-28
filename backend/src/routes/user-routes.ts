import { Router } from "express";

import type { UserController } from "../controllers/userController.ts";

export function createUserRoutes(controller: UserController): Router {
	const router = Router();

	router.get("/users", controller.list);
	router.post("/users", controller.create);
	router.post("/auth/login", controller.login);

	return router;
}