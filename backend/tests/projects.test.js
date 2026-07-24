import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Projects API', () => {
  let projectId;

  it('POST /api/projects creates a project and derives a key from the name', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Nexus Launch', description: 'Q3 launch plan' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('NEXUSLAUNCH'.slice(0, 6));
    projectId = res.body.data.id;
  });

  it('POST /api/projects rejects a missing name (failure path)', async () => {
    const res = await request(app).post('/api/projects').send({ description: 'no name' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/projects/:id returns 404 for an unknown project', async () => {
    const res = await request(app).get('/api/projects/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('POST /api/tasks with a projectId generates a sequential Jira-style ticketKey', async () => {
    const res1 = await request(app).post('/api/tasks').send({ title: 'First ticket', projectId });
    const res2 = await request(app).post('/api/tasks').send({ title: 'Second ticket', projectId });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.data.ticketKey).toBe('NEXUSL-1');
    expect(res2.body.data.ticketKey).toBe('NEXUSL-2');
  });

  it('POST /api/tasks with an unknown projectId returns 404', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Orphan ticket', projectId: 'nope' });
    expect(res.status).toBe(404);
  });

  it('GET /api/tasks?projectId=... only returns tickets for that project', async () => {
    const res = await request(app).get(`/api/tasks?projectId=${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every(t => t.projectId === projectId)).toBe(true);
  });

  it('DELETE /api/projects/:id cascades and removes its tickets', async () => {
    const delRes = await request(app).delete(`/api/projects/${projectId}`);
    expect(delRes.status).toBe(200);

    const tasksRes = await request(app).get(`/api/tasks?projectId=${projectId}`);
    expect(tasksRes.body.data.length).toBe(0);
  });
});

describe('AI Insights API', () => {
  it('GET /api/ai/insights falls back gracefully with no GROQ_API_KEY configured', async () => {
    const res = await request(app).get('/api/ai/insights');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.insight).toBe('string');
    expect(res.body.data.insight.length).toBeGreaterThan(0);
    expect(res.body.data.aiEnabled).toBe(false);
  });
});
