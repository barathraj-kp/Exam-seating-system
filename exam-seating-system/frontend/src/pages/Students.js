import React, { useState, useEffect } from 'react';
import { studentAPI, departmentAPI } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: '', roll_number: '', department_id: '', semester: '', section: '', email: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [st, dp] = await Promise.all([studentAPI.getAll(), departmentAPI.getAll()]);
      setStudents(st.data.data);
      setDepartments(dp.data.data);
    } catch (err) { showMsg('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const openModal = (student = null) => {
    setEditData(student);
    setForm(student ? {
      name: student.name, roll_number: student.roll_number,
      department_id: student.department_id || '', semester: student.semester || '',
      section: student.section || '', email: student.email || ''
    } : { name: '', roll_number: '', department_id: '', semester: '', section: '', email: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await studentAPI.update(editData.id, form);
        showMsg('Student updated successfully');
      } else {
        await studentAPI.create(form);
        showMsg('Student added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to save student', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentAPI.delete(id);
      showMsg('Student deleted');
      fetchData();
    } catch (err) { showMsg('Failed to delete', 'error'); }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || s.department_id == filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👨‍🎓 Students ({filtered.length})</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="search-bar">
              <span>🔍</span>
              <input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-group select" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.875rem' }}
              value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => openModal()}>+ Add Student</button>
          </div>
        </div>

        {loading ? <div className="loading">Loading students...</div> : (
          filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍🎓</div>
              <p>No students found. Add students to get started.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Roll Number</th><th>Name</th><th>Department</th><th>Semester</th><th>Section</th><th>Email</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.roll_number}</strong></td>
                      <td>{s.name}</td>
                      <td>{s.department_code ? <span className="badge badge-blue">{s.department_code}</span> : '—'}</td>
                      <td>{s.semester ? `Sem ${s.semester}` : '—'}</td>
                      <td>{s.section || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.email || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑️</button>
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
              <h3 className="modal-title">{editData ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Student name" />
                </div>
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input required value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} placeholder="e.g. CSE2021001" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}>
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="e.g. A, B, C" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="student@email.com" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 {editData ? 'Update' : 'Add'} Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
