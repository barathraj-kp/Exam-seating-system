import React, { useState, useEffect } from 'react';
import { seatingAPI, examAPI } from '../services/api';

const SearchSeat = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [examId, setExamId] = useState('');
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    examAPI.getAll().then(res => setExams(res.data.data)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await seatingAPI.search({ roll_number: rollNumber.trim(), exam_id: examId || undefined });
      setResults(res.data.data);
    } catch (err) {
      setResults([]);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🔍</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 6 }}>Find My Seat</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your roll number to find your exam seat assignment</p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Roll Number *</label>
            <input
              required
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              placeholder="e.g. CSE2021001"
              style={{ fontSize: '1rem', padding: '12px 16px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Exam (Optional — leave blank for all)</label>
            <select value={examId} onChange={e => setExamId(e.target.value)}>
              <option value="">All Exams</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.exam_name} — {e.subject} ({new Date(e.exam_date).toLocaleDateString('en-IN')})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', justifyContent: 'center' }}>
            🔍 Search Seat
          </button>
        </form>
      </div>

      {loading && <div className="loading" style={{ marginTop: 24 }}>⏳ Searching...</div>}

      {!loading && searched && results !== null && (
        <div style={{ maxWidth: 800, margin: '20px auto 0' }}>
          {results.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">😕</div>
                <p>No seat found for roll number <strong>{rollNumber}</strong>.</p>
                <p style={{ marginTop: 8, fontSize: '0.8rem' }}>Please check your roll number or contact the exam coordinator.</p>
              </div>
            </div>
          ) : (
            results.map((result, i) => (
              <div className="card" key={i} style={{ borderLeft: '4px solid var(--primary)', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, background: '#EEF2FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🪑</div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{result.student_name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Roll No: {result.roll_number}</p>
                  </div>
                  <span className="badge badge-green" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.9rem' }}>
                    Seat {result.seat_number}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  {[
                    { icon: '📝', label: 'Exam', value: result.exam_name },
                    { icon: '📚', label: 'Subject', value: result.subject },
                    { icon: '📅', label: 'Date', value: new Date(result.exam_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                    { icon: '🕐', label: 'Time', value: `${result.start_time} – ${result.end_time}` },
                    { icon: '🏛️', label: 'Hall', value: result.hall_name },
                    { icon: '🏢', label: 'Building', value: result.building || '—' },
                    { icon: '📍', label: 'Row', value: String.fromCharCode(64 + result.seat_row) },
                    { icon: '📌', label: 'Column', value: result.seat_col },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSeat;
