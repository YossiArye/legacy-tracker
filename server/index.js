import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import tasksRouter from './routes/tasks.js';
import { errorHandler } from './middleware/errorHandler.js';
import * as store from './store.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/tasks', tasksRouter);
app.use(errorHandler);

const SEED_TASKS = [
  { title: 'Set up project repo', priority: 'medium', completed: true },
  { title: 'Write onboarding docs', priority: 'low', completed: false },
  { title: 'Fix login bug reported by QA', priority: 'high', completed: false },
];

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  store.reset(SEED_TASKS);
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`TrackIt API listening on port ${PORT}`);
  });
}

export default app;
