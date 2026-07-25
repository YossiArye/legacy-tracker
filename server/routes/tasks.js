import { Router } from 'express';
import * as controller from '../controllers/tasksController.js';
import { validateTaskBody } from '../middleware/validateTaskBody.js';
import { validateBulkImportBody } from '../middleware/validateBulkImportBody.js';

const router = Router();

router.get('/', controller.listTasks);
router.get('/next', controller.nextTask);
router.get('/:id', controller.getTask);
router.post('/', validateTaskBody(), controller.createTask);
router.post('/import', validateBulkImportBody, controller.bulkImportTasks);
router.patch('/:id', validateTaskBody({ partial: true }), controller.updateTask);
router.delete('/:id', controller.deleteTask);

export default router;
