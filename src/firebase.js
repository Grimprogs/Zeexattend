import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBul_2Kv0p41iVsqkZ0uRe_XRF8geEZgbM',
  authDomain: 'zeexintern.firebaseapp.com',
  projectId: 'zeexintern',
  storageBucket: 'zeexintern.firebasestorage.app',
  messagingSenderId: '843472447776',
  appId: '1:843472447776:web:524ae28f34aecd701b8f45',
  measurementId: 'G-TG6J7EV96T',
}

const app = initializeApp(firebaseConfig)
export const analytics = isSupported().then((supported) => (supported ? getAnalytics(app) : null))

export const auth = getAuth(app)
export const db = getFirestore(app)
