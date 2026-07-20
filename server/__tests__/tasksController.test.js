import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import * as store from '../store.js';
import * as activityLog from '../activityLog.js';

describe('tasks API', () => {
  beforeEach(() => {
    store.reset();
    activityLog.clearLog();
  });

  it('GET /api/tasks returns an empty list initially', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/tasks creates a task and logs the activity', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Ship the release notes' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Ship the release notes');

    const log = activityLog.getLog();
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('created');
  });

  it('rejects a task with a too-short title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'ab' });
    expect(res.status).toBe(400);
  });

  it('GET /api/tasks?completed=true filters to completed tasks', async () => {
    const a = await request(app).post('/api/tasks').send({ title: 'Task A' });
    await request(app)
      .patch(`/api/tasks/${a.body.id}`)
      .send({ completed: true });
    await request(app).post('/api/tasks').send({ title: 'Task B' });

    const res = await request(app).get('/api/tasks?completed=true');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Task A');
  });

  it('DELETE /api/tasks/:id removes the task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Delete me' });
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(204);

    const list = await request(app).get('/api/tasks');
    expect(list.body).toHaveLength(0);
  });
});
