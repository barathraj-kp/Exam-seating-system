import React, { useState, useEffect } from 'react';
import { examAPI, studentAPI, hallAPI, departmentAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ exams: 0, students: 0, halls: 0, departments: 0 });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exams, students, halls, depts] = await Promise.all([
          examAPI.getAll(), studentAPI.getAll(), hallAPI.getAll(), departmentAPI.getAll()
        ]);
        setStats({
          exams: exams.data.data.length,
          students: students.data.data.length,
          halls: halls.data.data.length,
          departments: depts.data.data.length
        });
        setRecentExams(exams.data.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">⏳ Loading dashboard...</div>;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div className="stat-info">
            <h3>{stats.exams}</h3>
            <p>Total Exams</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👨‍🎓</div>
          <div className="stat-info">
            <h3>{stats.students}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🏛️</div>
          <div className="stat-info">
            <h3>{stats.halls}</h3>
            <p>Exam Halls</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🏢</div>
          <div className="stat-info">
            <h3>{stats.departments}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Recent Exams</h3>
        </div>
        {recentExams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No exams scheduled yet. Create your first exam to get started!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map(exam => (
                  <tr key={exam.id}>
                    <td><strong>{exam.exam_name}</strong></td>
                    <td>{exam.subject}</td>
                    <td>{new Date(exam.exam_date).toLocaleDateString('en-IN')}</td>
                    <td>{exam.start_time} - {exam.end_time}</td>
                    <td>
                      {exam.department_name
                        ? <span className="badge badge-blue">{exam.department_code}</span>
                        : <span className="badge badge-gray">All</span>}
                    </td>
                    <td>{exam.semester ? `Sem ${exam.semester}` : 'All'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🚀 Quick Start Guide</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { step: '1', title: 'Add Departments', desc: 'Create departments like CSE, ECE, etc.', icon: '🏢' },
            { step: '2', title: 'Add Exam Halls', desc: 'Configure halls with rows and columns', icon: '🏛️' },
            { step: '3', title: 'Add Students', desc: 'Import or add students with roll numbers', icon: '👨‍🎓' },
            { step: '4', title: 'Schedule Exam', desc: 'Create exam with date, time & subject', icon: '📝' },
            { step: '5', title: 'Generate Seating', desc: 'Auto-assign seats for the exam hall', icon: '🪑' },
          ].map(item => (
            <div key={item.step} style={{ padding: 16, background: 'var(--bg)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{item.icon}</div>
              <div style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>{item.step}</div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
