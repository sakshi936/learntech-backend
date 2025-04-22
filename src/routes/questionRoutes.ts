import { Router } from "express";

import { createQuestion, getAllQuestions, answerQuestion, upvoteQuestion } from "../controllers/questionController";
import { authenticateToken } from "../middleware/authenticateToken";

const router = Router();

router.post("/", authenticateToken, createQuestion); // Create a new question
router.get("/",authenticateToken, getAllQuestions); // Get all questions
router.put("/:questionId/answer", authenticateToken, answerQuestion); // Answer a question
router.put("/:questionId/upvote", authenticateToken, upvoteQuestion); // Upvote a question

export default router;