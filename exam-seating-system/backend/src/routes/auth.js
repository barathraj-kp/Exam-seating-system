const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Username, password and role are required' });
  }

  try {
    let user = null;

    if (role === 'admin') {
      const [rows] = await pool.query(
        'SELECT * FROM admins WHERE username = ? AND password = ?',
        [username, password]
      );
      if (rows.length) user = { ...rows[0], role: 'admin', displayName: rows[0].name };
    } else if (role === 'staff') {
      const [rows] = await pool.query(
        'SELECT s.*, d.name as department_name FROM staff s LEFT JOIN departments d ON s.department_id = d.id WHERE s.username = ? AND s.password = ?',
        [username, password]
      );
      if (rows.length) user = { ...rows[0], role: 'staff', displayName: rows[0].name };
    } else if (role === 'student') {
      const [rows] = await pool.query(
        'SELECT s.*, d.name as department_name, d.code as department_code FROM students s LEFT JOIN departments d ON s.department_id = d.id WHERE s.roll_number = ? AND s.password = ?',
        [username, password]
      );
      if (rows.length) user = { ...rows[0], role: 'student', displayName: rows[0].name };
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all staff (admin only)
router.get('/staff', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.username, s.email, s.department_id, d.name as department_name
       FROM staff s LEFT JOIN departments d ON s.department_id = d.id ORDER BY s.name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE staff
router.post('/staff', async (req, res) => {
  const { name, username, password, email, department_id } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ success: false, message: 'Name, username and password required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO staff (name, username, password, email, department_id) VALUES (?, ?, ?, ?, ?)',
      [name, username, password, email, department_id || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name, username, email } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Username already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE staff
router.delete('/staff/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE student password (by admin or staff)
router.put('/student/:id/password', async (req, res) => {
  const { password } = req.body;
  try {
    await pool.query('UPDATE students SET password = ? WHERE id = ?', [password, req.params.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
