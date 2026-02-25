import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { departmentAPI } from '../services/api';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', email: '', department_id: '' });

  const fetchData = async () => {
    try {
      const [s, d] = await Promise.all([
        axios.get('/api/auth/staff'),
        departmentAPI.getAll()
      ]);
      setStaffList(s.data.data);
      setDepartments(d.data.data);
    } catch (err) { showMsg('Failed to load staff', 'error'); }
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/staff', form);
      showMsg('Staff member created successfully');
      setShowModal(false);
      setForm({ name: '', username: '', password: '', email: '', department_id: '' });
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to create staff', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await axios.delete(`/api/auth/staff/${id}`);
      showMsg('Staff deleted');
      fetchData();
    } catch (err) { showMsg('Failed to delete', 'error'); }
  };

  return (
    <div>
      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 500, fontSize: '0.875rem',
          background: msg.type === 'error' ? '#FEF2F2' : '#ECFDF5',
          color: msg.type === 'error' ? '#DC2626' : '#065F46',
          border: `1px solid ${msg.type === 'error' ? '#FECACA' : '#A7F3D0'}`
        }}>{msg.text}</div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👨‍🏫 Staff Management ({staffList.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Staff</button>
        </div>

        {staffList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🏫</div>
            <p>No staff members yet. Add staff to get started.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Username</th><th>Email</th><th>Department</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {staffList.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="badge badge-blue">{s.username}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.email || '—'}</td>
                    <td>{s.department_name || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Staff Member</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. John Smith" />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="staff3" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Set a password" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="staff@college.com" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Department</label>
                  <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
