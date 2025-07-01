import { Router } from 'express';
import {
  getAllQuestion,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/question.controller';

export const questionRouter = Router();

questionRouter.get('/', getAllQuestion);
questionRouter.get('/:id', getQuestion);
questionRouter.post('/', createQuestion);
questionRouter.put('/:id', updateQuestion);
questionRouter.delete('/:id', deleteQuestion);
