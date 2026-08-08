const posts = require('./posts');
const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;
const { body, validationResult } = require('express-validator');

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({'status':'ok'});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.post('/posts', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('tags').optional().isArray().withMessage('tags must be an array')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, category, tags } = req.body || {};

  const newPost = {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  posts.push(newPost);

  res.status(201).json(newPost);
});

app.get('/posts', (req, res) => {

  const { term } = req.query;

  if (!term){
    return res.status(200).json(posts);
  }

  const lowerTerm = term.toLowerCase();

  const results = posts.filter(post =>
    post.title.toLowerCase().includes(lowerTerm) || post.content.toLowerCase().includes(lowerTerm) || post.category.toLowerCase().includes(lowerTerm)
  );

  res.status(200).json(results)
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find(post => post.id == req.params.id)

  if(!post){
    return res.status(404).json({error: 'Post not found'});
  }

  res.status(200).json(post);
});

app.put('/posts/:id', [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('tags').optional().isArray().withMessage('tags must be an array')
  ], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const post = posts.find(post => post.id == req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { title, content, category, tags } = req.body || {};

  if (!title && !content && !category && !tags) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  post.title = title !== undefined ? title : post.title;
  post.content = content !== undefined ? content : post.content;
  post.category = category !== undefined ? category : post.category;
  post.tags = tags !== undefined ? tags : post.tags;
  post.updatedAt = new Date().toISOString();

  res.status(200).json(post);
});

app.delete('/posts/:id', (req, res) => {
  const postIndex = posts.findIndex(post => post.id == req.params.id);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  posts.splice(postIndex, 1);

  res.sendStatus(204);
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.status || 500;

  console.error(err);

  const message = statusCode >= 500
    ? 'Sorry, something went wrong.'
    : err.message || 'Sorry, something went wrong.';

  res.status(statusCode).json({ error: message });
});
