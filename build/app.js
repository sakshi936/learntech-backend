"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnect_1 = __importDefault(require("./db/dbConnect"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Configure dotenv
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to database
(0, dbConnect_1.default)();
const PORT = process.env.PORT || 8000;
app.use(express_1.default.json());
app.use("/auth", authRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Successfully Connected with Typescript");
});
app.listen(PORT, () => {
    console.log(`Server is running at port : ${PORT}`);
});
