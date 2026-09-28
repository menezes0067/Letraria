import { createApp } from "./composition/create-app.ts";

const PORT = 3000;

createApp().listen(PORT, () => {
	console.log(`server is running http://localhost:${PORT}`);
});