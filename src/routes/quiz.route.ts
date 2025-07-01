import { Router } from 'express';
import {
  getAllQuiz,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from '../controllers/quiz.controller';

export const quizRouter = Router();

quizRouter.get('/', getAllQuiz);
quizRouter.get('/:id', getQuiz);
quizRouter.post('/', createQuiz);
quizRouter.put('/:id', updateQuiz);
quizRouter.delete('/:id', deleteQuiz);
