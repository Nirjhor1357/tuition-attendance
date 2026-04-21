import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'reports', label: 'Reports' },
  { id: 'parent', label: 'Parent View' },
];

function ShellLayout({ session, activePage, onNavigate, onLogout, children }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <h2>TuitionFlow</h2>
          <p>{session.instituteName}</p>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div>
            <h1>{NAV_ITEMS.find((item) => item.id === activePage)?.label || 'Dashboard'}</h1>
            <p>{session.name} ({session.email})</p>
          </div>
          <button className="btn btn-light" onClick={onLogout} type="button">
            Logout
          </button>
        </header>

        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}

export default ShellLayout;
