import { Router } from 'express';
import {
  getAllSection,
  getSection,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/section.controller';

export const sectionRouter = Router();

sectionRouter.get('/', getAllSection);
sectionRouter.get('/:id', getSection);
sectionRouter.post('/', createSection);
sectionRouter.put('/:id', updateSection);
sectionRouter.delete('/:id', deleteSection);
