import { Router } from 'express';
import * as controller from '../controllers/prioritiesController.js';

const router = Router();

router.get('/', controller.listPriorities);

export default router;
