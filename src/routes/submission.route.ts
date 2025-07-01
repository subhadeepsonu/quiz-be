import { Router } from 'express';
import {
  getAllSubmission,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission
} from '../controllers/submission.controller';

export const submissionRouter = Router();

submissionRouter.get('/', getAllSubmission);
submissionRouter.get('/:id', getSubmission);
submissionRouter.post('/', createSubmission);
submissionRouter.put('/:id', updateSubmission);
submissionRouter.delete('/:id', deleteSubmission);
