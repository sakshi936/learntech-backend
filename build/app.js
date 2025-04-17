"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnect_1 = __importDefault(require("./db/dbConnect"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const roadmapRoutes_1 = __importDefault(require("./routes/roadmapRoutes"));
const uploadBlog_route_1 = __importDefault(require("./routes/uploadBlog.route"));
// Configure dotenv
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Connect to database
(0, dbConnect_1.default)();
const PORT = process.env.PORT || 8000;
app.use(express_1.default.json());
app.use("/auth", authRoutes_1.default);
app.use("/profile", profileRoutes_1.default);
app.use("/progress", progressRoutes_1.default);
app.use("/roadmaps", roadmapRoutes_1.default);
//  blog routes
app.use("/api/blogs", uploadBlog_route_1.default);
app.get("/", (req, res) => {
    res.send("Successfully Connected with TechLearn Backend");
});
app.listen(PORT, () => {
    console.log(`Server is running at port with me : ${PORT}`);
});
