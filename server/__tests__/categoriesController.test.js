import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('categories API', () => {
  it('GET /api/categories returns the valid category values', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['work', 'personal', 'shopping', 'other']);
  });

  it('POST /api/categories is not a supported route', async () => {
    const res = await request(app).post('/api/categories');
    expect(res.status).toBe(404);
  });
});
