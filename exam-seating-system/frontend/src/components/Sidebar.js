import React from 'react';

const navConfig = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'OVERVIEW' },
    { id: 'exams', label: 'Exams', icon: '📝', section: 'MANAGEMENT' },
    { id: 'students', label: 'Students', icon: '👨‍🎓', section: null },
    { id: 'halls', label: 'Exam Halls', icon: '🏛️', section: null },
    { id: 'departments', label: 'Departments', icon: '🏢', section: null },
    { id: 'staff', label: 'Staff Members', icon: '👨‍🏫', section: null },
    { id: 'seating', label: 'Seating Arrangement', icon: '🪑', section: 'ARRANGEMENT' },
    { id: 'search', label: 'Find My Seat', icon: '🔍', section: null },
  ],
  staff: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'OVERVIEW' },
    { id: 'exams', label: 'Exams', icon: '📝', section: 'MANAGEMENT' },
    { id: 'students', label: 'Students', icon: '👨‍🎓', section: null },
    { id: 'halls', label: 'Exam Halls', icon: '🏛️', section: null },
    { id: 'seating', label: 'Seating Arrangement', icon: '🪑', section: 'ARRANGEMENT' },
    { id: 'search', label: 'Find My Seat', icon: '🔍', section: null },
  ],
  student: [
    { id: 'my-seats', label: 'My Seat Info', icon: '🪑', section: 'MY EXAMS' },
  ]
};

const roleBg = {
  admin: 'linear-gradient(180deg, #3b0764 0%, #6b21a8 100%)',
  staff: 'linear-gradient(180deg, #0c1a3a 0%, #1e3a8a 100%)',
  student: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)',
};
const roleBadge = { admin: '#a855f7', staff: '#3b82f6', student: '#10b981' };

const Sidebar = ({ activePage, setActivePage, user, onLogout }) => {
  const role = user?.role || 'student';
  const navItems = navConfig[role] || navConfig.student;
  let lastSection = null;

  return (
    <div className="sidebar" style={{ background: roleBg[role] }}>
      <div className="sidebar-logo">
        <h1>🎓 ExamSeat</h1>
        <span>Seating Management System</span>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: roleBadge[role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
          {role === 'admin' ? '🛡️' : role === 'staff' ? '👨‍🏫' : '👨‍🎓'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <span style={{ background: roleBadge[role], color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: 10, textTransform: 'uppercase' }}>{role}</span>
            {role === 'student' && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{user?.roll_number}</span>}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map(item => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <React.Fragment key={item.id}>
              {showSection && <div className="nav-section-title">{item.section}</div>}
              <button className={`nav-link ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
