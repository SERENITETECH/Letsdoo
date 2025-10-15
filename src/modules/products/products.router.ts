import { Router } from 'express';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import {
  listProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from './products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', listProductsHandler);
productsRouter.post('/', csrfProtection, createProductHandler);
productsRouter.get('/:id', getProductHandler);
productsRouter.patch('/:id', csrfProtection, updateProductHandler);
productsRouter.delete('/:id', csrfProtection, deleteProductHandler);
