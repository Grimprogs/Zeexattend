import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { QRCodeCanvas } from 'qrcode.react'
import Barcode from 'react-barcode'
import toast from 'react-hot-toast'
import TopBar from '../../components/TopBar'
import { db } from '../../firebase'
import { buildInternBarcodePayload, buildInternQrPayload, formatDateTime } from '../../utils/attendance'

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export default function InternProfilesPage() {
  const [interns, setInterns] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'interns'), orderBy('createdAt', 'desc')))
        setInterns(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
      } catch (error) {
        toast.error(error.message || 'Could not load intern profiles')
      }
    }

    loadProfiles()
  }, [])

  const qrPayload = useMemo(() => {
    if (!selected) return ''
    return buildInternQrPayload(selected)
  }, [selected])

  const barcodePayload = useMemo(() => {
    if (!selected) return ''
    return buildInternBarcodePayload(selected)
  }, [selected])

  return (
    <section className="fade-up">
      <TopBar title="Intern Profiles" subtitle="Cards with quick contact info and QR preview" />

      <div className="profile-grid">
        {interns.map((intern) => (
          <article key={intern.uid} className="glass-card profile-tile" onClick={() => setSelected(intern)}>
            <div className="avatar">{initials(intern.name)}</div>
            <h3>{intern.name}</h3>
            <p>{intern.department}</p>
            <small>{intern.phone}</small>
          </article>
        ))}
      </div>

      {selected &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setSelected(null)}>
            <div className="modal-card glass-card" onClick={(event) => event.stopPropagation()}>
              <h2>{selected.name}</h2>
              <p>{selected.email}</p>
              <p>{selected.phone}</p>
              <p>{selected.department}</p>
              <p>Registered: {formatDateTime(selected.createdAt)}</p>
              <div className="qr-wrap">
                <QRCodeCanvas value={qrPayload} size={200} bgColor="#fff" fgColor="#0a0a0f" includeMargin />
              </div>
              <h3 className="barcode-heading">Machine Barcode (CODE128)</h3>
              <div className="barcode-wrap">
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
              <button className="btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
