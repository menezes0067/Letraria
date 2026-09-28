import { Router } from "express";

import type { BookController } from "../controllers/bookController.ts";

export function createBookRoutes(controller: BookController): Router {
	const router = Router();

	router.get("/books", controller.list);
	router.post("/books", controller.create);
	router.put("/books/:id", controller.update);
	router.delete("/books/:id", controller.remove);

	return router;
}