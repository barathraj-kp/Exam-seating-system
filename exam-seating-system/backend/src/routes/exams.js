const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all exams
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, d.name as department_name, d.code as department_code 
       FROM exams e LEFT JOIN departments d ON e.department_id = d.id 
       ORDER BY e.exam_date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single exam
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT e.*, d.name as department_name FROM exams e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create exam
router.post('/', async (req, res) => {
  const { exam_name, subject, exam_date, start_time, end_time, department_id, semester } = req.body;
  if (!exam_name || !subject || !exam_date || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO exams (exam_name, subject, exam_date, start_time, end_time, department_id, semester) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [exam_name, subject, exam_date, start_time, end_time, department_id, semester]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update exam
router.put('/:id', async (req, res) => {
  const { exam_name, subject, exam_date, start_time, end_time, department_id, semester } = req.body;
  try {
    await pool.query(
      'UPDATE exams SET exam_name=?, subject=?, exam_date=?, start_time=?, end_time=?, department_id=?, semester=? WHERE id=?',
      [exam_name, subject, exam_date, start_time, end_time, department_id, semester, req.params.id]
    );
    res.json({ success: true, message: 'Exam updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete exam
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
