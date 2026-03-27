import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth } from '../firebase'
import { ADMIN_EMAIL } from '../utils/attendance'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, form.email, form.password)
      const target = credential.user.email === ADMIN_EMAIL ? '/admin' : '/intern'
      toast.success('Login successful')
      navigate(target)
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card glass-card fade-up" onSubmit={onSubmit}>
        <h1>InternTrack Login</h1>
        <p>Use intern credentials or admin@interntrack.com</p>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={onChange} required />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="auth-link">
          New intern? <Link to="/signup">Create account</Link>
        </p>
      </form>
    </div>
  )
}
