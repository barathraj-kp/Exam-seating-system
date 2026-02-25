import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data.data);
    } catch (err) { showMsg('Failed to load departments', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepts(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await departmentAPI.create(form);
      showMsg('Department created successfully');
      setForm({ name: '', code: '' });
      setShowForm(false);
      fetchDepts();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to create department', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This will affect related students and exams.')) return;
    try {
      await departmentAPI.delete(id);
      showMsg('Department deleted');
      fetchDepts();
    } catch (err) { showMsg('Failed to delete', 'error'); }
  };

  const colors = ['badge-blue', 'badge-green', 'badge-orange', 'badge-red', 'badge-gray'];

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏢 Departments ({departments.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Department'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'var(--bg)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <h4 style={{ marginBottom: 16, fontWeight: 700 }}>New Department</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Department Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Computer Science" />
              </div>
              <div className="form-group">
                <label>Department Code *</label>
                <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. CSE" maxLength="20" />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="submit" className="btn btn-primary">💾 Create Department</button>
            </div>
          </form>
        )}

        {loading ? <div className="loading">Loading...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {departments.map((dept, i) => (
              <div key={dept.id} style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${colors[i % colors.length]}`} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>{dept.code}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dept.id)}>🗑️</button>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dept.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Added {new Date(dept.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <div style={{ gridColumn: '1/-1' }}>
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <p>No departments yet. Add your first department above.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
