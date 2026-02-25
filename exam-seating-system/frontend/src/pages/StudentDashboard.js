import React, { useState, useEffect } from 'react';
import { seatingAPI, examAPI } from '../services/api';

const StudentDashboard = ({ user }) => {
  const [seats, setSeats] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchExam, setSearchExam] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seatRes, examRes] = await Promise.all([
          seatingAPI.search({ roll_number: user.roll_number }),
          examAPI.getAll()
        ]);
        setSeats(seatRes.data.data);
        setExams(examRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.roll_number]);

  const filteredSeats = searchExam
    ? seats.filter(s => s.exam_id == searchExam)
    : seats;

  const upcomingSeats = filteredSeats.filter(s => new Date(s.exam_date) >= new Date());
  const pastSeats = filteredSeats.filter(s => new Date(s.exam_date) < new Date());

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>⏳ Loading your seat information...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857, #059669)',
        borderRadius: 16, padding: 28, marginBottom: 24, color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            👨‍🎓
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Welcome, {user.name}!</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '0.9rem' }}>
              Roll No: <strong>{user.roll_number}</strong> &nbsp;|&nbsp;
              {user.department_name || 'N/A'} &nbsp;|&nbsp;
              {user.semester ? `Semester ${user.semester}` : ''} {user.section ? `- Section ${user.section}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Exams', value: seats.length, icon: '📝', color: '#4F46E5' },
          { label: 'Upcoming', value: upcomingSeats.length, icon: '⏰', color: '#059669' },
          { label: 'Completed', value: pastSeats.length, icon: '✅', color: '#D97706' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>🔎 Filter by Exam:</span>
          <select
            value={searchExam}
            onChange={e => setSearchExam(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem', flex: 1 }}
          >
            <option value="">All Exams</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.exam_name} — {e.subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Seat Cards */}
      {filteredSeats.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🪑</div>
          <h3 style={{ color: '#1E293B', marginBottom: 8 }}>No Seat Assigned Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Your seat hasn't been assigned for any upcoming exam. Please check back later or contact your exam coordinator.
          </p>
        </div>
      ) : (
        <>
          {upcomingSeats.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⏰ Upcoming Exams
              </h3>
              {upcomingSeats.map((seat, i) => <SeatCard key={i} seat={seat} upcoming={true} />)}
            </div>
          )}
          {pastSeats.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                ✅ Completed Exams
              </h3>
              {pastSeats.map((seat, i) => <SeatCard key={i} seat={seat} upcoming={false} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SeatCard = ({ seat, upcoming }) => (
  <div style={{
    background: '#fff',
    borderRadius: 14,
    padding: 24,
    border: `1.5px solid ${upcoming ? '#A7F3D0' : '#E2E8F0'}`,
    marginBottom: 14,
    borderLeft: `5px solid ${upcoming ? '#059669' : '#94A3B8'}`
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{seat.exam_name}</h4>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>📚 {seat.subject}</p>
      </div>
      <div style={{
        background: upcoming ? '#ECFDF5' : '#F1F5F9',
        color: upcoming ? '#059669' : '#64748B',
        padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: '1.1rem'
      }}>
        Seat {seat.seat_number}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 16 }}>
      {[
        { icon: '📅', label: 'Date', value: new Date(seat.exam_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
        { icon: '🕐', label: 'Time', value: `${seat.start_time} – ${seat.end_time}` },
        { icon: '🏛️', label: 'Hall', value: seat.hall_name },
        { icon: '📍', label: 'Row & Column', value: `Row ${String.fromCharCode(64 + seat.seat_row)}, Col ${seat.seat_col}` },
      ].map(item => (
        <div key={item.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{item.icon} {item.label}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>{item.value}</div>
        </div>
      ))}
    </div>
  </div>
);

export default StudentDashboard;
