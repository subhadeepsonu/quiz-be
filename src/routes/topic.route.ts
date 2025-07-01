import { Router } from 'express';
import {
  getAllTopic,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic
} from '../controllers/topic.controller';

export const topicRouter = Router();

topicRouter.get('/', getAllTopic);
topicRouter.get('/:id', getTopic);
topicRouter.post('/', createTopic);
topicRouter.put('/:id', updateTopic);
topicRouter.delete('/:id', deleteTopic);
