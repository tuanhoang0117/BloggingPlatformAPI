const posts = require('./posts');
const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({'status':'ok'});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.post('/posts', (req, res) => {
  const { title, content, category, tags } = req.body || {};

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
  res.status(200).json(posts)
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find(post => post.id == req.params.id)

  if(!post){
    return res.status(404).json({error: 'Post not found'});
  }

  res.status(200).json(post);
});

app.put('/posts/:id', (req, res) => {
  const post = posts.find(post => post.id == req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { title, content, category, tags } = req.body || {};

  if (!title && !content && !category) {
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
