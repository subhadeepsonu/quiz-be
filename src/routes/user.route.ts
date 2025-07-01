import { Router } from 'express';
import {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/', getAllUser);
userRouter.get('/:id', getUser);
userRouter.post('/', createUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);
