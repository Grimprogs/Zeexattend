import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard Overview' },
  { to: '/admin/scanner', label: 'QR Scanner' },
  { to: '/admin/interns', label: 'All Interns' },
  { to: '/admin/logs', label: 'Attendance Logs' },
  { to: '/admin/profiles', label: 'Intern Profiles' },
]

export default function AdminLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="sidebar glass-card fade-up">
        <h2>InternTrack</h2>
        <p>{user?.email}</p>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
