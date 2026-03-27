import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allow }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div className="center-shell">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allow && role !== allow) {
    return <Navigate to={role === 'admin' ? '/admin' : '/intern'} replace />
  }

  return <Outlet />
}
