import React, { useState, useEffect } from 'react';
import { hallAPI } from '../services/api';

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    name: '', building: '', floor_number: 1, num_rows: '', num_cols: ''
  });

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const res = await hallAPI.getAll();
      setHalls(res.data.data);
    } catch (err) {
      showMsg('Failed to load halls', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHalls(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const openModal = (hall = null) => {
    setEditData(hall);
    setForm(hall ? {
      name: hall.name,
      building: hall.building || '',
      floor_number: hall.floor_number || 1,
      num_rows: hall.num_rows,
      num_cols: hall.num_cols
    } : {
      name: '', building: '', floor_number: 1, num_rows: '', num_cols: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await hallAPI.update(editData.id, form);
        showMsg('Hall updated successfully');
      } else {
        await hallAPI.create(form);
        showMsg('Hall created successfully');
      }
      setShowModal(false);
      fetchHalls();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to save hall', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hall?')) return;
    try {
      await hallAPI.delete(id);
      showMsg('Hall deleted');
      fetchHalls();
    } catch (err) {
      showMsg('Failed to delete', 'error');
    }
  };

  return (
    <div>
      {msg && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 20
      }}>
        {!loading && halls.map(hall => (
          <div className="card" key={hall.id} style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>🏛️ {hall.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {hall.building || 'Building not set'} • Floor {hall.floor_number}
                </p>
              </div>
              <span className="badge badge-blue">{hall.capacity} seats</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                ['Rows', hall.num_rows],
                ['Columns', hall.num_cols],
                ['Capacity', hall.capacity]
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 8, marginBottom: 12, textAlign: 'center' }}>
              <div style={{ background: '#1e1b4b', color: '#fff', borderRadius: 4, padding: '4px 8px', fontSize: '0.65rem', marginBottom: 6, fontWeight: 600 }}>
                BLACKBOARD
              </div>
              <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${Math.min(hall.num_cols, 8)}, 8px)`, gap: 2 }}>
                {Array.from({ length: Math.min(hall.num_rows * hall.num_cols, 40) }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: '#818CF8', opacity: 0.7 }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openModal(hall)}>
                ✏️ Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(hall.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}

        <div
          className="card"
          style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--border)', minHeight: 200 }}
          onClick={() => openModal()}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>➕</div>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Add New Hall</p>
        </div>
      </div>

      {loading && <div className="loading">Loading halls...</div>}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editData ? 'Edit Hall' : 'Add New Hall'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Hall Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Hall A"
                  />
                </div>
                <div className="form-group">
                  <label>Building</label>
                  <input
                    value={form.building}
                    onChange={e => setForm({ ...form, building: e.target.value })}
                    placeholder="e.g. Main Block"
                  />
                </div>
                <div className="form-group">
                  <label>Floor Number</label>
                  <input
                    type="number"
                    min="0"
                    value={form.floor_number}
                    onChange={e => setForm({ ...form, floor_number: e.target.value })}
                  />
                </div>
                <div className="form-group" />
                <div className="form-group">
                  <label>Number of Rows *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="20"
                    value={form.num_rows}
                    onChange={e => setForm({ ...form, num_rows: e.target.value })}
                    placeholder="e.g. 6"
                  />
                </div>
                <div className="form-group">
                  <label>Number of Columns *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="20"
                    value={form.num_cols}
                    onChange={e => setForm({ ...form, num_cols: e.target.value })}
                    placeholder="e.g. 8"
                  />
                </div>
              </div>

              {form.num_rows && form.num_cols && (
                <div className="alert alert-info" style={{ marginTop: 12 }}>
                  📊 This hall will have <strong>{form.num_rows * form.num_cols} seats</strong> ({form.num_rows} rows × {form.num_cols} columns)
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 {editData ? 'Update' : 'Create'} Hall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Halls;