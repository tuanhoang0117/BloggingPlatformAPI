import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from './prisma.js';

const app = express();
const PORT = process.env.PORT || 3000;

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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { title, content, category, tags } = req.body || {};

  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      category,
      tags: tags || [],
    },
  });

  res.status(201).json(newPost);
});

app.get('/posts', async (req, res) => {

  const { term } = req.query;

  if (!term){
    const allPosts = await prisma.post.findMany();
    return res.status(200).json(allPosts);
  }

  const results = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } }
      ]
    }
  });

  res.status(200).json(results)
});

app.get('/posts/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id }
  });

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
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const post = await prisma.post.findUnique({
    where: { id: req.params.id }
  });

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { title, content, category, tags } = req.body || {};

  if (!title && !content && !category && !tags) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updatedPost = await prisma.post.update({
    where: { id: req.params.id },
    data: { title, content, category, tags}
  });

  res.status(200).json(updatedPost);
});

app.delete('/posts/:id', async (req, res) => {
  const post = await prisma.post.findUnique({where: {id: req.params.id}});

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  await prisma.post.delete({ where: { id: req.params.id } });

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
