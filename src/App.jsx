import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import InternDashboard from './pages/InternDashboard'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import ScannerPage from './pages/admin/ScannerPage'
import AllInternsPage from './pages/admin/AllInternsPage'
import AttendanceLogsPage from './pages/admin/AttendanceLogsPage'
import InternProfilesPage from './pages/admin/InternProfilesPage'
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#121225',
              color: '#f2f2f6',
              border: '1px solid #252544',
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute allow="intern" />}>
            <Route path="/intern" element={<InternDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allow="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="scanner" element={<ScannerPage />} />
              <Route path="interns" element={<AllInternsPage />} />
              <Route path="logs" element={<AttendanceLogsPage />} />
              <Route path="profiles" element={<InternProfilesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
