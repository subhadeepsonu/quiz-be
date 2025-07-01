import { Router } from 'express';
import {
  getAllQuiz_section,
  getQuiz_section,
  createQuiz_section,
  updateQuiz_section,
  deleteQuiz_section
} from '../controllers/quiz_section.controller';

export const quiz_sectionRouter = Router();

quiz_sectionRouter.get('/', getAllQuiz_section);
quiz_sectionRouter.get('/:id', getQuiz_section);
quiz_sectionRouter.post('/', createQuiz_section);
quiz_sectionRouter.put('/:id', updateQuiz_section);
quiz_sectionRouter.delete('/:id', deleteQuiz_section);
