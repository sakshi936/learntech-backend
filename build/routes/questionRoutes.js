"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionController_1 = require("../controllers/questionController");
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = (0, express_1.Router)();
router.post("/", authenticateToken_1.authenticateToken, questionController_1.createQuestion); // Create a new question
router.get("/", authenticateToken_1.authenticateToken, questionController_1.getAllQuestions); // Get all questions
router.put("/:questionId/answer", authenticateToken_1.authenticateToken, questionController_1.answerQuestion); // Answer a question
router.put("/:questionId/upvote", authenticateToken_1.authenticateToken, questionController_1.upvoteQuestion); // Upvote a question
exports.default = router;
