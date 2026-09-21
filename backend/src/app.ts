import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
	res.json({
		message: "API funcionando"
	});
});

const PORT = 3000

app.listen(PORT, () => {
	console.log(`server is running http://localhost:${PORT}`);
});
