import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from './app.js';

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
