const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create department
router.post('/', async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
  try {
    const [result] = await pool.query('INSERT INTO departments (name, code) VALUES (?, ?)', [name, code.toUpperCase()]);
    res.status(201).json({ success: true, data: { id: result.insertId, name, code } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
