import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleConfig = {
    admin: {
      label: 'Admin',
      icon: '🛡️',
      color: '#7C3AED',
      light: '#F5F3FF',
      border: '#DDD6FE',
      hint: 'Username: admin | Password: admin123',
      userLabel: 'Username',
      placeholder: 'Enter admin username'
    },
    staff: {
      label: 'Staff',
      icon: '👨‍🏫',
      color: '#0369A1',
      light: '#EFF6FF',
      border: '#BFDBFE',
      hint: 'Username: staff1 | Password: staff123',
      userLabel: 'Username',
      placeholder: 'Enter staff username'
    },
    student: {
      label: 'Student',
      icon: '👨‍🎓',
      color: '#047857',
      light: '#ECFDF5',
      border: '#A7F3D0',
      hint: 'Roll Number: CSE2021001 | Password: 123456',
      userLabel: 'Roll Number',
      placeholder: 'Enter your roll number'
    }
  };

  const current = roleConfig[role];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { username, password, role });
      onLogin(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Background pattern */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            width: 200 + i * 100,
            height: 200 + i * 100,
            top: `${10 + i * 15}%`,
            left: `${-5 + i * 20}%`,
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🎓</div>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>ExamSeat</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 4 }}>
            Exam Hall Seating Arrangement System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 36,
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, color: '#1E293B' }}>
            Sign In to Your Account
          </h2>

          {/* Role Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
            {Object.entries(roleConfig).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setRole(key); setError(''); setUsername(''); setPassword(''); }}
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: `2px solid ${role === key ? cfg.color : '#E2E8F0'}`,
                  background: role === key ? cfg.light : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{cfg.icon}</span>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: role === key ? cfg.color : '#64748B'
                }}>{cfg.label}</span>
              </button>
            ))}
          </div>

          {/* Hint */}
          <div style={{
            background: current.light,
            border: `1px solid ${current.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: '0.78rem',
            color: current.color,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            💡 Demo — {current.hint}
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
              padding: '10px 14px', marginBottom: 16, fontSize: '0.85rem',
              color: '#DC2626', fontWeight: 500
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                {current.userLabel}
              </label>
              <input
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={current.placeholder}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box', color: '#1E293B',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = current.color}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box', color: '#1E293B',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = current.color}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: loading ? '#94A3B8' : current.color,
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '0.3px'
              }}
            >
              {loading ? '⏳ Signing in...' : `${current.icon} Sign In as ${current.label}`}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 20 }}>
          © 2024 ExamSeat — Exam Hall Seating Arrangement System
        </p>
      </div>
    </div>
  );
};

export default Login;
