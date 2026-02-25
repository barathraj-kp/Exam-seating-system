import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Halls from './pages/Halls';
import Departments from './pages/Departments';
import Exams from './pages/Exams';
import Seating from './pages/Seating';
import SearchSeat from './pages/SearchSeat';
import StudentDashboard from './pages/StudentDashboard';
import StaffManagement from './pages/StaffManagement';
import './styles/global.css';

const pageTitles = {
  dashboard: '📊 Dashboard',
  exams: '📝 Exams',
  students: '👨‍🎓 Students',
  halls: '🏛️ Exam Halls',
  departments: '🏢 Departments',
  staff: '👨‍🏫 Staff Management',
  seating: '🪑 Seating Arrangement',
  search: '🔍 Find My Seat',
  'my-seats': '🪑 My Seat Information',
};

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('examUser')); } catch { return null; }
  });
  const [activePage, setActivePage] = useState(() => {
    const u = (() => { try { return JSON.parse(localStorage.getItem('examUser')); } catch { return null; } })();
    return u?.role === 'student' ? 'my-seats' : 'dashboard';
  });

  const handleLogin = (userData) => {
    localStorage.setItem('examUser', JSON.stringify(userData));
    setUser(userData);
    setActivePage(userData.role === 'student' ? 'my-seats' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('examUser');
    setUser(null);
    setActivePage('dashboard');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    // Student only sees their own dashboard
    if (user.role === 'student') return <StudentDashboard user={user} />;

    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'exams': return <Exams />;
      case 'students': return <Students />;
      case 'halls': return <Halls />;
      case 'departments': return user.role === 'admin' ? <Departments /> : <Dashboard />;
      case 'staff': return user.role === 'admin' ? <StaffManagement /> : <Dashboard />;
      case 'seating': return <Seating />;
      case 'search': return <SearchSeat />;
      default: return <Dashboard />;
    }
  };

  const roleLabel = { admin: '🛡️ Admin Panel', staff: '👨‍🏫 Staff Panel', student: '👨‍🎓 Student Portal' };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} onLogout={handleLogout} />
      <div className="main-content">
        <div className="top-bar">
          <h2>{user.role === 'student' ? '🪑 My Seat Information' : pageTitles[activePage]}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{roleLabel[user.role]}</span>
          </div>
        </div>
        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default App;
