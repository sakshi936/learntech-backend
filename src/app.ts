import express, { Application, Request, Response } from "express";
import dotenv from 'dotenv';
import dbConnect from "./db/dbConnect";
import authRoutes from "./routes/authRoutes";

// Configure dotenv
dotenv.config();

const app: Application = express();


// Connect to database
dbConnect();

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
	res.send("Successfully Connected with Typescript");
});


app.listen(PORT, () => {
	console.log(`Server is running at port : ${PORT}`);
});
