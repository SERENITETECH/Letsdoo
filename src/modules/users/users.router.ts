import { Router } from 'express';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { deleteUserHandler, listUsersHandler, updateUserRoleHandler } from './users.controller.js';

export const usersRouter = Router();

usersRouter.get('/', listUsersHandler);
usersRouter.patch('/:id/role', csrfProtection, updateUserRoleHandler);
usersRouter.delete('/:id', csrfProtection, deleteUserHandler);
