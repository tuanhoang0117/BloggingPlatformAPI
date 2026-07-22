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
  const { title, content, category, tags } = req.body;

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
