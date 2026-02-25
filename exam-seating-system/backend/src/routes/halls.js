const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM halls ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM halls WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Hall not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, building, floor_number, num_rows, num_cols } = req.body;
  if (!name || !num_rows || !num_cols) {
    return res.status(400).json({ success: false, message: 'Name, rows and cols required' });
  }
  const capacity = num_rows * num_cols;
  try {
    const [result] = await pool.query(
      'INSERT INTO halls (name, building, floor_number, num_rows, num_cols, capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, building, floor_number || 1, num_rows, num_cols, capacity]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name, building, floor_number, num_rows, num_cols, capacity } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, building, floor_number, num_rows, num_cols } = req.body;
  const capacity = num_rows * num_cols;
  try {
    await pool.query(
      'UPDATE halls SET name=?, building=?, floor_number=?, num_rows=?, num_cols=?, capacity=? WHERE id=?',
      [name, building, floor_number, num_rows, num_cols, capacity, req.params.id]
    );
    res.json({ success: true, message: 'Hall updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM halls WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Hall deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
