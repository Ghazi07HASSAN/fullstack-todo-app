// server/index.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 0. Home Route (Cannot GET / ko khatam karne ke liye)
app.get('/', (req, res) => {
  res.send('🚀 Backend Server aur Database Active hai!');
});

// 1. GET ALL TODOS
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).send('Database Error: ' + err.message);
  }
});

// 2. ADD A TODO
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required hai' });

    const newTodo = await pool.query(
      'INSERT INTO todos (title) VALUES($1) RETURNING *',
      [title]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).send('Database Error: ' + err.message);
  }
});

// 3. UPDATE A TODO
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const updatedTodo = await pool.query(
      'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title, completed, id]
    );

    res.json(updatedTodo.rows[0]);
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).send('Database Error: ' + err.message);
  }
});

// 4. DELETE A TODO
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Todo delete ho gaya!' });
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).send('Database Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
});