import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query, where, doc, getDoc } from 'firebase/firestore'
import { QRCodeCanvas } from 'qrcode.react'
import Barcode from 'react-barcode'
import toast from 'react-hot-toast'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  buildInternBarcodePayload,
  buildInternQrPayload,
  formatDateTime,
  formatTimeOnly,
} from '../utils/attendance'

export default function InternDashboard() {
  const { user, logout } = useAuth()
  const [intern, setIntern] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const qrRef = useRef(null)
  const barcodeRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return
      setLoading(true)
      try {
        const internDoc = await getDoc(doc(db, 'interns', user.uid))
        if (!internDoc.exists()) {
          toast.error('Intern profile not found')
          return
        }
        const internData = internDoc.data()
        setIntern(internData)

        const logsQuery = query(
          collection(db, 'attendance'),
          where('uid', '==', user.uid),
          orderBy('entryTime', 'desc'),
        )
        const logsSnapshot = await getDocs(logsQuery)
        setLogs(logsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
      } catch (error) {
        toast.error(error.message || 'Failed to load intern dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.uid])

  const qrPayload = useMemo(() => {
    if (!intern) return ''
    return buildInternQrPayload(intern)
  }, [intern])

  const barcodePayload = useMemo(() => {
    if (!intern) return ''
    return buildInternBarcodePayload(intern)
  }, [intern])

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas || !intern) return
    const image = canvas.toDataURL('image/png')
    const anchor = document.createElement('a')
    anchor.href = image
    anchor.download = `${intern.name.replace(/\s+/g, '_').toLowerCase()}_qr.png`
    anchor.click()
  }

  const downloadBarcode = () => {
    const svg = barcodeRef.current?.querySelector('svg')
    if (!svg || !intern) return

    const serializer = new XMLSerializer()
    const svgData = serializer.serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (context) {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0)
        const anchor = document.createElement('a')
        anchor.href = canvas.toDataURL('image/png')
        anchor.download = `${intern.name.replace(/\s+/g, '_').toLowerCase()}_barcode.png`
        anchor.click()
      }
      URL.revokeObjectURL(svgUrl)
    }

    image.src = svgUrl
  }

  if (loading) {
    return <div className="center-shell">Loading intern dashboard...</div>
  }

  return (
    <div className="page-shell intern-layout">
      <header className="glass-card intern-header fade-up">
        <div>
          <h1>Intern Dashboard</h1>
          <p>{intern?.name}</p>
        </div>
        <div className="row-actions">
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
          <Link className="btn-ghost" to="/login">
            Back to Login
          </Link>
        </div>
      </header>

      <section className="intern-grid fade-up delay-1">
        <article className="glass-card profile-card">
          <h2>Profile</h2>
          <ul className="data-list">
            <li>
              <span>Name</span>
              <strong>{intern?.name}</strong>
            </li>
            <li>
              <span>Email</span>
              <strong>{intern?.email}</strong>
            </li>
            <li>
              <span>Phone</span>
              <strong>{intern?.phone}</strong>
            </li>
            <li>
              <span>Department</span>
              <strong>{intern?.department}</strong>
            </li>
            <li>
              <span>Created At</span>
              <strong>{formatDateTime(intern?.createdAt)}</strong>
            </li>
          </ul>
        </article>

        <article className="glass-card qr-card" ref={qrRef}>
          <h2>Your Attendance QR</h2>
          <div className="qr-wrap">
            <QRCodeCanvas
              value={qrPayload}
              size={220}
              bgColor="#ffffff"
              fgColor="#0a0a0f"
              includeMargin
              level="H"
            />
          </div>
          <button className="btn-primary" onClick={downloadQr}>
            Download QR PNG
          </button>

          <h2 className="barcode-heading">Machine Barcode (CODE128)</h2>
          <div className="barcode-wrap" ref={barcodeRef}>
            <Barcode
              value={barcodePayload}
              format="CODE128"
              width={2}
              height={72}
              margin={0}
              displayValue
              background="#ffffff"
              lineColor="#0a0a0f"
            />
          </div>
          <button className="btn-secondary" onClick={downloadBarcode}>
            Download Barcode PNG
          </button>
        </article>
      </section>

      <section className="glass-card attendance-card fade-up delay-2">
        <h2>My Attendance History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{formatTimeOnly(item.entryTime)}</td>
                  <td>{formatTimeOnly(item.exitTime)}</td>
                  <td>
                    <span className={`pill ${item.status}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4}>No attendance logs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
