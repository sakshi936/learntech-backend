import express, { Application, Request, Response } from "express";

const app: Application = express();
const PORT = 8000;
app.get("/", (req: Request, res: Response) => {
	res.send("Successfully Connected with Typescript");
});

app.listen(PORT, () => {
	console.log(`Server is running at port : ${PORT}`);
});
