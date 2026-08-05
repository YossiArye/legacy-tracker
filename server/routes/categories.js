import { Router } from 'express';
import * as controller from '../controllers/categoriesController.js';

const router = Router();

router.get('/', controller.listCategories);

export default router;
