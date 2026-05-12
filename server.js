const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET /api/checkin?date=2024-01-15
app.get('/api/checkin', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const result = await pool.query(
      'SELECT * FROM checkins WHERE date = $1', [date]
    );
    if (result.rows.length === 0) {
      return res.json({ date, tasks_done: [], coins: 0, completed: false });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/checkins/week?start=2024-01-13
app.get('/api/checkins/week', async (req, res) => {
  const { start } = req.query;
  if (!start) return res.status(400).json({ error: 'start date required' });
  try {
    const result = await pool.query(
      `SELECT date, completed, coins FROM checkins
       WHERE date >= $1 AND date < $1::date + interval '7 days'
       ORDER BY date`,
      [start]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/streak
app.get('/api/streak', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT date FROM checkins WHERE completed = true ORDER BY date DESC LIMIT 30`
    );
    // Count consecutive days ending today
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 0; i < result.rows.length; i++) {
      const d = new Date(result.rows[i].date);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (d.toDateString() === expected.toDateString()) streak++;
      else break;
    }
    res.json({ streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// PUT /api/checkin - upsert
app.put('/api/checkin', async (req, res) => {
  const { date, tasks_done, coins, completed } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const result = await pool.query(
      `INSERT INTO checkins (date, tasks_done, coins, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (date) DO UPDATE SET
         tasks_done = $2,
         coins = $3,
         completed = $4,
         updated_at = NOW()
       RETURNING *`,
      [date, tasks_done || [], coins || 0, completed || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
