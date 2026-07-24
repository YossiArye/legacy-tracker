import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as tasksService from '../services/tasksService.js';

const router = Router();

router.get(
  '/',
  asyncHandler((req, res) => {
    const tasks = tasksService.listTasks({ completed: req.query.completed });
    res.json(tasks);
  })
);

router.get(
  '/next',
  asyncHandler((req, res) => {
    const task = tasksService.nextTask();
    res.json(task);
  })
);

router.get(
  '/:id',
  asyncHandler((req, res) => {
    const task = tasksService.getTask(Number(req.params.id));
    res.json(task);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const task = await tasksService.createTask(req.body);
    res.status(201).json(task);
  })
);

router.post(
  '/import',
  asyncHandler(async (req, res) => {
    const result = await tasksService.bulkImportTasks(req.body.data);
    res.status(201).json(result);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const updated = await tasksService.updateTask(Number(req.params.id), req.body);
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await tasksService.deleteTask(Number(req.params.id));
    res.status(204).end();
  })
);

export default router;
