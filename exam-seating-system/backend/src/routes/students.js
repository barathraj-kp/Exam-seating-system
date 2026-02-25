const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all students
router.get('/', async (req, res) => {
  try {
    const { department_id, semester, section } = req.query;
    let query = `SELECT s.*, d.name as department_name, d.code as department_code 
                 FROM students s LEFT JOIN departments d ON s.department_id = d.id WHERE 1=1`;
    const params = [];
    if (department_id) { query += ' AND s.department_id = ?'; params.push(department_id); }
    if (semester) { query += ' AND s.semester = ?'; params.push(semester); }
    if (section) { query += ' AND s.section = ?'; params.push(section); }
    query += ' ORDER BY s.roll_number';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, d.name as department_name FROM students s LEFT JOIN departments d ON s.department_id = d.id WHERE s.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  const { name, roll_number, department_id, semester, section, email } = req.body;
  if (!name || !roll_number) return res.status(400).json({ success: false, message: 'Name and roll number required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, roll_number, department_id, semester, section, email) VALUES (?, ?, ?, ?, ?, ?)',
      [name, roll_number, department_id, semester, section, email]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Roll number already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  const { name, roll_number, department_id, semester, section, email } = req.body;
  try {
    await pool.query(
      'UPDATE students SET name=?, roll_number=?, department_id=?, semester=?, section=?, email=? WHERE id=?',
      [name, roll_number, department_id, semester, section, email, req.params.id]
    );
    res.json({ success: true, message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
