import { Router } from 'express';
import * as controller from '../controllers/tasksController.js';

const router = Router();

router.get('/', controller.listTasks);
router.get('/next', controller.nextTask);
router.get('/:id', controller.getTask);
router.post('/', controller.createTask);
router.post('/import', controller.bulkImportTasks);
router.patch('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

export default router;
