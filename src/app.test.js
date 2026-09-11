import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from './app.js';
import prisma from './prisma.js';

beforeEach(async () => {
  await prisma.post.deleteMany();
});

describe('GET /health', () => {
  test('returns 200 and status ok', async () => {
    const res = await request(app).get('/health');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });
});

describe('GET /posts', () => {
  test('returns 200 and an array', async () => {
    const res = await request(app).get('/posts');

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});

describe('POST /posts validation', () => {
  test('rejects a body missing required fields with 400', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'only a title' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Validation failed');
  });

  test('rejects tags that are not an array with 400', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 't', content: 'c', category: 'cat', tags: 'not an array' });

    assert.equal(res.status, 400);
  });
});

describe('POST /posts', () => {
  test('creates a post and returns 201 with an id', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Test Post', content: 'Test content', category: 'testing' });

    assert.equal(res.status, 201);
    assert.ok(res.body.id);
    assert.equal(res.body.title, 'Test Post');
  });
});

describe('PUT /posts/:id', () =>{
  test('updates a post and the change persists', async () => {
    const createRes = await request(app)
      .post('/posts')
      .send({ title: 'Original Title', content: 'Original content', category: 'testing' });

    const updated = await request(app)
      .put(`/posts/${createRes.body.id}`)
      .send({ title: 'Changed' });
  
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, 'Changed');
    assert.equal(updated.body.content, 'Original content');

    const fetched = await request(app).get(`/posts/${createRes.body.id}`);
    assert.equal(fetched.body.title, 'Changed');
  });
});