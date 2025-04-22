"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upvoteQuestion = exports.answerQuestion = exports.getAllQuestions = exports.createQuestion = void 0;
const questionModel_1 = require("../models/questionModel");
const createQuestion = async (req, res) => {
    try {
        const { username, question } = req.body;
        if (!username || !question) {
            res.status(400).json({ message: 'Name and question are required' });
            return;
        }
        const newQuestion = new questionModel_1.EventQuestionModel({
            username,
            question,
        });
        await newQuestion.save();
        res.status(201).json({ message: 'Question created successfully', question: newQuestion });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating question', error });
    }
};
exports.createQuestion = createQuestion;
const getAllQuestions = async (req, res) => {
    try {
        const questions = await questionModel_1.EventQuestionModel.find({}).sort({ createdAt: -1 });
        res.status(200).json(questions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error });
    }
};
exports.getAllQuestions = getAllQuestions;
const answerQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer } = req.body;
        const { role } = req.user; // Assuming you have user role in req.user
        if (role !== 'admin') {
            res.status(403).json({ message: 'Only admins can answer questions' });
            return;
        }
        if (!answer) {
            res.status(400).json({ message: 'Answer is required' });
            return;
        }
        const question = await questionModel_1.EventQuestionModel.findByIdAndUpdate(questionId, { answer, isAnswered: true }, { new: true });
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.status(200).json({ message: 'Question answered successfully', question });
    }
    catch (error) {
        res.status(500).json({ message: 'Error answering question', error });
    }
};
exports.answerQuestion = answerQuestion;
const upvoteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = req.user.userId;
        // Find the question first to check if user already upvoted
        const existingQuestion = await questionModel_1.EventQuestionModel.findById(questionId);
        if (!existingQuestion) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        // Check if user already upvoted this question
        if (existingQuestion.upvotedBy && existingQuestion.upvotedBy.includes(userId)) {
            res.status(400).json({ message: 'You have already upvoted this question' });
            return;
        }
        // Update the question with upvote and add user to upvotedBy array
        const question = await questionModel_1.EventQuestionModel.findByIdAndUpdate(questionId, {
            $inc: { upvotes: 1 },
            $addToSet: { upvotedBy: userId }
        }, { new: true });
        res.status(200).json({ message: 'Question upvoted successfully', question });
    }
    catch (error) {
        res.status(500).json({ message: 'Error upvoting question', error });
    }
};
exports.upvoteQuestion = upvoteQuestion;
