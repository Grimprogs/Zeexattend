import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { ADMIN_EMAIL } from '../utils/attendance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = () => {}

    const initializeAuth = async () => {
      await setPersistence(auth, browserLocalPersistence).catch(() => {})

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null)
          setRole(null)
          setLoading(false)
          return
        }

        setUser(firebaseUser)

        if (firebaseUser.email === ADMIN_EMAIL) {
          const adminRef = doc(db, 'admins', firebaseUser.uid)
          const adminDoc = await getDoc(adminRef)
          if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
            setRole('admin')
          } else {
            setRole('intern')
          }
        } else {
          setRole('intern')
        }
        setLoading(false)
      })
    }

    initializeAuth()

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      logout: () => signOut(auth),
    }),
    [loading, role, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
