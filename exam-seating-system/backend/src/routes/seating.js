const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get seating arrangement for an exam
router.get('/exam/:examId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sa.*, s.name as student_name, s.roll_number, s.section,
              d.name as department_name, d.code as department_code,
              h.name as hall_name, h.num_rows as hall_rows, h.num_cols as hall_cols
       FROM seating_arrangements sa
       JOIN students s ON sa.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       JOIN halls h ON sa.hall_id = h.id
       WHERE sa.exam_id = ?
       ORDER BY h.name, sa.seat_row, sa.seat_col`,
      [req.params.examId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get seating by hall for an exam
router.get('/exam/:examId/hall/:hallId', async (req, res) => {
  try {
    const [hall] = await pool.query('SELECT * FROM halls WHERE id = ?', [req.params.hallId]);
    if (!hall.length) return res.status(404).json({ success: false, message: 'Hall not found' });

    const [seats] = await pool.query(
      `SELECT sa.*, s.name as student_name, s.roll_number, s.section,
              d.name as department_name, d.code as department_code
       FROM seating_arrangements sa
       JOIN students s ON sa.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE sa.exam_id = ? AND sa.hall_id = ?
       ORDER BY sa.seat_row, sa.seat_col`,
      [req.params.examId, req.params.hallId]
    );

    res.json({ success: true, data: { hall: hall[0], seats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auto-generate seating arrangement
router.post('/generate', async (req, res) => {
  const { exam_id, hall_ids, department_id, semester, arrangement_type } = req.body;
  if (!exam_id || !hall_ids || !hall_ids.length) {
    return res.status(400).json({ success: false, message: 'Exam ID and at least one hall required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Delete existing arrangement for this exam
    await conn.query('DELETE FROM seating_arrangements WHERE exam_id = ?', [exam_id]);

    // Get students
    let studentQuery = 'SELECT id, roll_number, department_id FROM students WHERE 1=1';
    const params = [];
    if (department_id) { studentQuery += ' AND department_id = ?'; params.push(department_id); }
    if (semester) { studentQuery += ' AND semester = ?'; params.push(semester); }
    studentQuery += ' ORDER BY roll_number';
    const [students] = await conn.query(studentQuery, params);

    if (!students.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'No students found with given criteria' });
    }

    // Get halls info
    const placeholders = hall_ids.map(() => '?').join(',');
    const [halls] = await conn.query(
      `SELECT * FROM halls WHERE id IN (${placeholders}) ORDER BY name`,
      hall_ids
    );

    // Shuffle students if random arrangement
    let orderedStudents = [...students];
    if (arrangement_type === 'random') {
      orderedStudents = orderedStudents.sort(() => Math.random() - 0.5);
    }

    // Assign seats using num_rows and num_cols
    let studentIndex = 0;
    const insertData = [];

    for (const hall of halls) {
      for (let row = 1; row <= hall.num_rows && studentIndex < orderedStudents.length; row++) {
        for (let col = 1; col <= hall.num_cols && studentIndex < orderedStudents.length; col++) {
          const student = orderedStudents[studentIndex];
          const seatNumber = `${String.fromCharCode(64 + row)}${col}`;
          insertData.push([exam_id, hall.id, student.id, row, col, seatNumber]);
          studentIndex++;
        }
      }
    }

    if (insertData.length > 0) {
      await conn.query(
        'INSERT INTO seating_arrangements (exam_id, hall_id, student_id, seat_row, seat_col, seat_number) VALUES ?',
        [insertData]
      );
    }

    await conn.commit();
    res.json({
      success: true,
      message: `Seating arrangement generated for ${insertData.length} students`,
      data: {
        total_students: students.length,
        assigned: insertData.length,
        unassigned: students.length - insertData.length
      }
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// Manually assign a seat
router.post('/assign', async (req, res) => {
  const { exam_id, hall_id, student_id, seat_row, seat_col } = req.body;
  try {
    const seatNumber = `${String.fromCharCode(64 + seat_row)}${seat_col}`;
    await pool.query(
      `INSERT INTO seating_arrangements (exam_id, hall_id, student_id, seat_row, seat_col, seat_number)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE student_id=?, seat_number=?`,
      [exam_id, hall_id, student_id, seat_row, seat_col, seatNumber, student_id, seatNumber]
    );
    res.json({ success: true, message: 'Seat assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete seating arrangement for exam
router.delete('/exam/:examId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM seating_arrangements WHERE exam_id = ?',
      [req.params.examId]
    );
    res.json({ success: true, message: `Deleted ${result.affectedRows} seat assignments` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Search student seat by roll number
router.get('/search', async (req, res) => {
  const { roll_number, exam_id } = req.query;
  if (!roll_number) return res.status(400).json({ success: false, message: 'Roll number required' });
  try {
    let query = `SELECT sa.*, s.name as student_name, s.roll_number,
                        h.name as hall_name, h.building,
                        e.exam_name, e.subject, e.exam_date, e.start_time, e.end_time
                 FROM seating_arrangements sa
                 JOIN students s ON sa.student_id = s.id
                 JOIN halls h ON sa.hall_id = h.id
                 JOIN exams e ON sa.exam_id = e.id
                 WHERE s.roll_number = ?`;
    const params = [roll_number];
    if (exam_id) { query += ' AND sa.exam_id = ?'; params.push(exam_id); }
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;