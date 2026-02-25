import React, { useState, useEffect } from 'react';
import { seatingAPI, examAPI, hallAPI, departmentAPI } from '../services/api';

const SeatingGrid = ({ hall, seats }) => {
  const seatMap = {};
  seats.forEach(s => { seatMap[`${s.seat_row}-${s.seat_col}`] = s; });

  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ marginBottom: 12, fontWeight: 700 }}>🏛️ {hall.hall_name} — {seats.length} students assigned</h4>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ background: '#1e1b4b', color: '#fff', display: 'inline-block', padding: '6px 40px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
          📖 BLACKBOARD
        </div>
      </div>
      <div className="hall-grid-container">
        <div className="hall-grid" style={{ gridTemplateColumns: `28px repeat(${hall.hall_cols}, 72px)` }}>
          {/* Column headers */}
          <div />
          {Array.from({ length: hall.hall_cols }, (_, c) => (
            <div key={c} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, paddingBottom: 4 }}>{c + 1}</div>
          ))}
          {/* Seats */}
          {Array.from({ length: hall.hall_rows }, (_, r) => (
            <React.Fragment key={r}>
              <div className="row-label">{String.fromCharCode(65 + r)}</div>
              {Array.from({ length: hall.hall_cols }, (_, c) => {
                const seat = seatMap[`${r + 1}-${c + 1}`];
                return (
                  <div key={c} className={`seat ${seat ? 'occupied' : 'empty'}`}>
                    <div style={{ fontWeight: 800, fontSize: '0.65rem' }}>{String.fromCharCode(65 + r)}{c + 1}</div>
                    {seat ? (
                      <>
                        <div style={{ fontSize: '0.55rem', lineHeight: 1.2 }}>{seat.roll_number}</div>
                        <div style={{ fontSize: '0.5rem', color: '#6366F1', opacity: 0.8 }}>{seat.department_code || ''}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.55rem', color: '#16A34A' }}>Free</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const Seating = () => {
  const [exams, setExams] = useState([]);
  const [halls, setHalls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [seatingData, setSeatingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [genForm, setGenForm] = useState({
    hall_ids: [], department_id: '', semester: '', arrangement_type: 'sequential'
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [ex, hl, dp] = await Promise.all([examAPI.getAll(), hallAPI.getAll(), departmentAPI.getAll()]);
        setExams(ex.data.data);
        setHalls(hl.data.data);
        setDepartments(dp.data.data);
      } catch (err) { }
    };
    fetchMeta();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadSeating = async (examId) => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await seatingAPI.getByExam(examId);
      setSeatingData(res.data.data);
    } catch (err) { showMsg('Failed to load seating', 'error'); }
    finally { setLoading(false); }
  };

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
    setSeatingData([]);
    if (e.target.value) loadSeating(e.target.value);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genForm.hall_ids.length) { showMsg('Select at least one hall', 'error'); return; }
    setGenerating(true);
    try {
      const res = await seatingAPI.generate({ exam_id: selectedExam, ...genForm });
      showMsg(`✅ ${res.data.message}`);
      setShowGenModal(false);
      loadSeating(selectedExam);
    } catch (err) { showMsg(err.response?.data?.message || 'Generation failed', 'error'); }
    finally { setGenerating(false); }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all seating arrangements for this exam?')) return;
    try {
      await seatingAPI.delete(selectedExam);
      showMsg('Seating arrangement cleared');
      setSeatingData([]);
    } catch (err) { showMsg('Failed to clear', 'error'); }
  };

  const handleHallToggle = (hallId) => {
    const id = String(hallId);
    setGenForm(prev => ({
      ...prev,
      hall_ids: prev.hall_ids.includes(id) ? prev.hall_ids.filter(h => h !== id) : [...prev.hall_ids, id]
    }));
  };

  // Group seating data by hall
  const hallGroups = {};
  seatingData.forEach(seat => {
    if (!hallGroups[seat.hall_id]) {
      hallGroups[seat.hall_id] = {
        hall_id: seat.hall_id, hall_name: seat.hall_name,
        hall_rows: seat.hall_rows, hall_cols: seat.hall_cols, seats: []
      };
    }
    hallGroups[seat.hall_id].seats.push(seat);
  });

  const selectedExamData = exams.find(e => e.id == selectedExam);

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🪑 Seating Arrangement</h3>
          {selectedExam && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
                {viewMode === 'grid' ? '📋 Table View' : '🏛️ Grid View'}
              </button>
              {seatingData.length > 0 && <button className="btn btn-danger btn-sm" onClick={handleClear}>🗑️ Clear</button>}
              <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>⚡ Generate Seating</button>
            </div>
          )}
        </div>

        <div className="form-group" style={{ maxWidth: 380, marginBottom: 20 }}>
          <label>Select Exam</label>
          <select value={selectedExam} onChange={handleExamChange}>
            <option value="">Choose an exam...</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.exam_name} — {e.subject} ({new Date(e.exam_date).toLocaleDateString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        {selectedExamData && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            📝 <strong>{selectedExamData.exam_name}</strong> &nbsp;|&nbsp;
            {selectedExamData.subject} &nbsp;|&nbsp;
            {new Date(selectedExamData.exam_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp;
            🕐 {selectedExamData.start_time} – {selectedExamData.end_time}
          </div>
        )}

        {loading && <div className="loading">⏳ Loading seating arrangement...</div>}

        {!loading && selectedExam && seatingData.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🪑</div>
            <p>No seating arrangement found for this exam.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowGenModal(true)}>
              ⚡ Generate Seating Arrangement
            </button>
          </div>
        )}

        {!loading && seatingData.length > 0 && (
          <>
            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#EEF2FF', borderColor: '#6366F1' }} />Occupied</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#F0FDF4', borderColor: '#86EFAC' }} />Empty</div>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Assigned: <strong>{seatingData.length}</strong> students across <strong>{Object.keys(hallGroups).length}</strong> hall(s)
              </span>
            </div>

            {viewMode === 'grid' ? (
              Object.values(hallGroups).map(hall => (
                <SeatingGrid key={hall.hall_id} hall={hall} seats={hall.seats} />
              ))
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Roll Number</th><th>Student Name</th><th>Department</th><th>Hall</th><th>Seat</th><th>Row</th><th>Column</th></tr>
                  </thead>
                  <tbody>
                    {seatingData.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td><strong>{s.roll_number}</strong></td>
                        <td>{s.student_name}</td>
                        <td>{s.department_code ? <span className="badge badge-blue">{s.department_code}</span> : '—'}</td>
                        <td>{s.hall_name}</td>
                        <td><span className="badge badge-orange">{s.seat_number}</span></td>
                        <td>{String.fromCharCode(64 + s.seat_row)}</td>
                        <td>{s.seat_col}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Generate Modal */}
      {showGenModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">⚡ Generate Seating Arrangement</h3>
              <button className="modal-close" onClick={() => setShowGenModal(false)}>✕</button>
            </div>

            <form onSubmit={handleGenerate}>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                ℹ️ This will overwrite any existing seating arrangement for this exam.
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Select Halls * (Choose one or more)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginTop: 8 }}>
                  {halls.map(hall => (
                    <label key={hall.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                      background: genForm.hall_ids.includes(String(hall.id)) ? '#EEF2FF' : 'var(--bg)',
                      border: `1.5px solid ${genForm.hall_ids.includes(String(hall.id)) ? '#6366F1' : 'var(--border)'}`,
                      borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                    }}>
                      <input type="checkbox" checked={genForm.hall_ids.includes(String(hall.id))}
                        onChange={() => handleHallToggle(hall.id)} style={{ accentColor: '#6366F1' }} />
                      <div>
                        <div>{hall.name}</div>
                        <div style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.7rem' }}>{hall.capacity} seats</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Filter by Department</label>
                  <select value={genForm.department_id} onChange={e => setGenForm({...genForm, department_id: e.target.value})}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Filter by Semester</label>
                  <select value={genForm.semester} onChange={e => setGenForm({...genForm, semester: e.target.value})}>
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Arrangement Type</label>
                  <select value={genForm.arrangement_type} onChange={e => setGenForm({...genForm, arrangement_type: e.target.value})}>
                    <option value="sequential">Sequential (by roll number)</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={generating}>
                  {generating ? '⏳ Generating...' : '⚡ Generate Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seating;
