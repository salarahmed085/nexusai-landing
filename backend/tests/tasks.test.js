import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health check', () => {
  it('GET /api/health returns a 200 success payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Tasks API', () => {
  let createdTaskId;

  it('POST /api/tasks creates a task (happy path)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write test suite', description: 'Cover the API', status: 'Pending', priority: 'High' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: 'Write test suite',
      status: 'Pending',
      priority: 'High',
    });
    expect(res.body.data.id).toBeTruthy();

    createdTaskId = res.body.data.id;
  });

  it('POST /api/tasks rejects a missing title (failure path)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'No title here' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/tasks rejects an invalid priority (failure path)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Bad priority task', priority: 'Urgent' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tasks returns the list including the created task', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(t => t.id === createdTaskId)).toBe(true);
  });

  it('GET /api/tasks/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/tasks/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/tasks/:id updates an existing task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .send({ status: 'Completed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Completed');
  });

  it('GET /api/tasks/stats returns aggregated counts', async () => {
    const res = await request(app).get('/api/tasks/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('byPriority');
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/tasks/:id removes the task, and it is gone afterward', async () => {
    const delRes = await request(app).delete(`/api/tasks/${createdTaskId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/tasks/${createdTaskId}`);
    expect(getRes.status).toBe(404);
  });
});

describe('Auth API', () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;

  it('POST /api/auth/signup creates a user (happy path)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: uniqueEmail, password: 'Password1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(uniqueEmail);
  });

  it('POST /api/auth/signup rejects a weak password (failure path)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Weak Pw', email: `weak-${Date.now()}@example.com`, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login rejects wrong credentials (failure path)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login succeeds with correct credentials (happy path)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
  });
});
