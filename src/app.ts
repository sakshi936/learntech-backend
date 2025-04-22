import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import dbConnect from "./db/dbConnect";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import profileRoutes from "./routes/profileRoutes";
import progressRoutes from "./routes/progressRoutes";
import roadmapRoutes from "./routes/roadmapRoutes";
import blogRoutes from "./routes/uploadBlog.route";
import questionRoutes from "./routes/questionRoutes";
// Configure dotenv
dotenv.config();

const app: Application = express();

// CORS configuration
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// Connect to database
dbConnect();

const PORT = process.env.PORT || 8000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/progress", progressRoutes);
app.use("/roadmaps", roadmapRoutes);
//  blog routes
app.use("/api/blogs", blogRoutes);
app.use("/questions", questionRoutes);

app.get("/", (req: Request, res: Response) => {
	res.send("Successfully Connected with TechLearn Backend");
});

app.listen(PORT, () => {
	console.log(`Server is running at port with me : ${PORT}`);
});
