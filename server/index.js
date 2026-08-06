import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import tasksRouter from './routes/tasks.js';
import prioritiesRouter from './routes/priorities.js';
import categoriesRouter from './routes/categories.js';
import * as store from './store.js';

const app = express();
// Falls back to '*' when CLIENT_ORIGIN is unset: passing `undefined` straight
// through would overwrite the cors package's own '*' default and emit no
// Access-Control-Allow-Origin header at all, breaking local/standalone use.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use('/api/tasks', tasksRouter);
app.use('/api/priorities', prioritiesRouter);
app.use('/api/categories', categoriesRouter);

const SEED_TASKS = [
  { title: 'Set up project repo', priority: 'medium', category: 'work', completed: true },
  { title: 'Write onboarding docs', priority: 'low', category: 'work', completed: false },
  { title: 'Fix login bug reported by QA', priority: 'high', category: 'work', completed: false },
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
