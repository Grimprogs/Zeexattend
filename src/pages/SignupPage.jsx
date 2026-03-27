import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { auth, db } from '../firebase'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  password: '',
}

export default function SignupPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isValidPhone = useMemo(() => /^\+?[0-9]{10,15}$/.test(form.phone), [form.phone])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!isValidPhone) {
      toast.error('Enter a valid phone number (10-15 digits)')
      return
    }

    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'interns', credential.user.uid), {
        uid: credential.user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        createdAt: serverTimestamp(),
        profileComplete: true,
      })
      toast.success('Signup successful')
      navigate('/intern')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card glass-card fade-up" onSubmit={onSubmit}>
        <h1>Create Intern Profile</h1>
        <p>Register once to generate your unique attendance QR code.</p>

        <label>
          Full Name
          <input type="text" name="name" value={form.name} onChange={onChange} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>

        <label>
          Phone Number
          <input type="tel" name="phone" value={form.phone} onChange={onChange} required />
        </label>

        <label>
          Department
          <input type="text" name="department" value={form.department} onChange={onChange} required />
        </label>

        <label>
          Password
          <input type="password" name="password" minLength={6} value={form.password} onChange={onChange} required />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-link">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
