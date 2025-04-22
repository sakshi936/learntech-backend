import { Request, Response } from 'express';
import { EventQuestionModel } from '../models/questionModel';

export const createQuestion = async (req: Request, res: Response) => {
   try {
      const { username, question } = req.body;

      if (!username || !question) {
         res.status(400).json({ message: 'Name and question are required' });
         return 
      }

      const newQuestion = new EventQuestionModel({
         username,
         question,
      });

      await newQuestion.save();
      res.status(201).json({ message: 'Question created successfully', question: newQuestion });
   } catch (error) {
      res.status(500).json({ message: 'Error creating question', error });
   }
}

export const getAllQuestions = async (req: Request, res: Response) => {
   try {
      const questions = await EventQuestionModel.find({}).sort({ createdAt: -1 });
      res.status(200).json(questions);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching questions', error });
   }
}

export const answerQuestion = async (req: Request, res: Response) => {
   try {
      const { questionId } = req.params;
      const { answer } = req.body;
      const { role } = req.user; // Assuming you have user role in req.user
      if (role !== 'admin') {
         res.status(403).json({ message: 'Only admins can answer questions' });
         return 
      }

      if (!answer) {
         res.status(400).json({ message: 'Answer is required' });
         return 
      }

      const question = await EventQuestionModel.findByIdAndUpdate(
         questionId,
         { answer, isAnswered: true },
         { new: true }
      );

      if (!question) {
         res.status(404).json({ message: 'Question not found' });
         return 
      }

      res.status(200).json({ message: 'Question answered successfully', question });
   } catch (error) {
      res.status(500).json({ message: 'Error answering question', error });
   }
}

export const upvoteQuestion = async (req: Request, res: Response) => {
   try {
      const { questionId } = req.params;
      const userId = req.user.userId;
      
      // Find the question first to check if user already upvoted
      const existingQuestion = await EventQuestionModel.findById(questionId);
      
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
      const question = await EventQuestionModel.findByIdAndUpdate(
         questionId,
         { 
            $inc: { upvotes: 1 },
            $addToSet: { upvotedBy: userId } 
         },
         { new: true }
      );
      
      res.status(200).json({ message: 'Question upvoted successfully', question });
   } catch (error) {
      res.status(500).json({ message: 'Error upvoting question', error });
   }
}