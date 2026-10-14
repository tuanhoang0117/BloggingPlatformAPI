import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from './app.js';
import prisma from './prisma.js';

beforeEach(async () => {
  await prisma.post.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
});

async function createPost(fields = {}) {
  const res = await request(app)
    .post('/posts')
    .send({ title: 'Title', content: 'Content', category: 'general', ...fields });
  return res.body;
}

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

describe('GET /posts/:id', () => {
  test('returns the post when it exists', async () => {
    const post = await createPost({ title: 'Find me' });

    const res = await request(app).get(`/posts/${post.id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, post.id);
    assert.equal(res.body.title, 'Find me');
  });

  test('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/posts/does-not-exist');

    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: 'Post not found' });
  });
});

describe('PUT /posts/:id errors', () => {
  test('returns 404 for an unknown id', async () => {
    const res = await request(app)
      .put('/posts/does-not-exist')
      .send({ title: 'Changed' });

    assert.equal(res.status, 404);
  });

  test('rejects an empty update body with 400', async () => {
    const post = await createPost();

    const res = await request(app).put(`/posts/${post.id}`).send({});

    assert.equal(res.status, 400);
  });
});

describe('DELETE /posts/:id', () => {
  test('deletes the post, returns 204, and the post is gone', async () => {
    const post = await createPost();

    const res = await request(app).delete(`/posts/${post.id}`);
    assert.equal(res.status, 204);

    const fetched = await request(app).get(`/posts/${post.id}`);
    assert.equal(fetched.status, 404);
  });

  test('returns 404 for an unknown id', async () => {
    const res = await request(app).delete('/posts/does-not-exist');

    assert.equal(res.status, 404);
  });
});

describe('GET /posts?term=', () => {
  test('matches title, content, or category case-insensitively and excludes non-matches', async () => {
    await createPost({ title: 'Learning NODE', content: 'x', category: 'a' });
    await createPost({ title: 'y', content: 'all about node streams', category: 'b' });
    await createPost({ title: 'z', content: 'z', category: 'Node' });
    await createPost({ title: 'Cooking', content: 'pasta', category: 'food' });

    const res = await request(app).get('/posts?term=node');

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 3);
    assert.ok(res.body.every((p) => p.title !== 'Cooking'));
  });
});
