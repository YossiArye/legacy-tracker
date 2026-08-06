import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('priorities API', () => {
  it('GET /api/priorities returns the valid priority levels', async () => {
    const res = await request(app).get('/api/priorities');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['low', 'medium', 'high']);
  });

  it('POST /api/priorities is not a supported route', async () => {
    const res = await request(app).post('/api/priorities');
    expect(res.status).toBe(404);
  });
});
