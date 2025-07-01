import { Router } from 'express';
import {
  getAllPlan,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/plan.controller';

export const planRouter = Router();

planRouter.get('/', getAllPlan);
planRouter.get('/:id', getPlan);
planRouter.post('/', createPlan);
planRouter.put('/:id', updatePlan);
planRouter.delete('/:id', deletePlan);
