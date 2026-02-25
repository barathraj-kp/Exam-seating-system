import React, { useState, useEffect } from 'react';
import { examAPI, departmentAPI } from '../services/api';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    exam_name: '', subject: '', exam_date: '', start_time: '', end_time: '', department_id: '', semester: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ex, dp] = await Promise.all([examAPI.getAll(), departmentAPI.getAll()]);
      setExams(ex.data.data);
      setDepartments(dp.data.data);
    } catch (err) { showMsg('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const openModal = (exam = null) => {
    setEditData(exam);
    setForm(exam ? {
      exam_name: exam.exam_name, subject: exam.subject,
      exam_date: exam.exam_date?.split('T')[0] || '', start_time: exam.start_time || '',
      end_time: exam.end_time || '', department_id: exam.department_id || '', semester: exam.semester || ''
    } : { exam_name: '', subject: '', exam_date: '', start_time: '', end_time: '', department_id: '', semester: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await examAPI.update(editData.id, form);
        showMsg('Exam updated successfully');
      } else {
        await examAPI.create(form);
        showMsg('Exam created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to save exam', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam and all its seating arrangements?')) return;
    try {
      await examAPI.delete(id);
      showMsg('Exam deleted');
      fetchData();
    } catch (err) { showMsg('Failed to delete', 'error'); }
  };

  const getStatusBadge = (examDate) => {
    const today = new Date();
    const date = new Date(examDate);
    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (date < today) return <span className="badge badge-gray">Completed</span>;
    if (date.getTime() === today.getTime()) return <span className="badge badge-orange">Today</span>;
    return <span className="badge badge-green">Upcoming</span>;
  };

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📝 Exams ({exams.length})</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>+ Schedule Exam</button>
        </div>

        {loading ? <div className="loading">Loading exams...</div> : (
          exams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No exams scheduled yet. Create your first exam!</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Exam Name</th><th>Subject</th><th>Date</th><th>Time</th><th>Department</th><th>Semester</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {exams.map(exam => (
                    <tr key={exam.id}>
                      <td><strong>{exam.exam_name}</strong></td>
                      <td>{exam.subject}</td>
                      <td>{new Date(exam.exam_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ fontSize: '0.8rem' }}>{exam.start_time} – {exam.end_time}</td>
                      <td>{exam.department_code ? <span className="badge badge-blue">{exam.department_code}</span> : <span className="badge badge-gray">All Depts</span>}</td>
                      <td>{exam.semester ? `Sem ${exam.semester}` : 'All'}</td>
                      <td>{getStatusBadge(exam.exam_date)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(exam)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editData ? 'Edit Exam' : 'Schedule New Exam'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Exam Name *</label>
                  <input required value={form.exam_name} onChange={e => setForm({...form, exam_name: e.target.value})} placeholder="e.g. Mid Semester Exam 2024" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Subject *</label>
                  <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Data Structures and Algorithms" />
                </div>
                <div className="form-group">
                  <label>Exam Date *</label>
                  <input required type="date" value={form.exam_date} onChange={e => setForm({...form, exam_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input required type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input required type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}>
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 {editData ? 'Update' : 'Schedule'} Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
