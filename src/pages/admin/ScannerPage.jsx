import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import TopBar from '../../components/TopBar'
import { db } from '../../firebase'
import { formatDateTime, parseQrPayload, toDateKey } from '../../utils/attendance'

export default function ScannerPage() {
  const scannerRegionId = 'interntrack-scanner'
  const scannerRef = useRef(null)
  const scannerStartedRef = useRef(false)
  const fileInputRef = useRef(null)
  const isProcessingRef = useRef(false)
  const [lastScan, setLastScan] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerRegionId)
    scannerRef.current = scanner

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            if (isProcessingRef.current) return
            isProcessingRef.current = true
            await handleScan(decodedText)
            setTimeout(() => {
              isProcessingRef.current = false
            }, 1200)
          },
          () => {},
        )
        scannerStartedRef.current = true
      } catch (error) {
        toast.error(error.message || 'Camera access failed')
      }
    }

    startScanner()

    return () => {
      const safeStop = async () => {
        try {
          if (scannerStartedRef.current) {
            await scanner.stop()
          }
        } catch {
          // Ignore stop errors caused by race conditions in dev/strict mode.
        } finally {
          scannerStartedRef.current = false
          try {
            await scanner.clear()
          } catch {
            // Ignore clear errors when scanner was never fully initialized.
          }
        }
      }
      safeStop()
    }
  }, [])

  const handleScan = async (decodedText) => {
    const payload = parseQrPayload(decodedText)
    if (!payload) {
      toast.error('Invalid QR payload')
      return
    }

    try {
      const internSnap = await getDoc(doc(db, 'interns', payload.uid))
      if (!internSnap.exists()) {
        toast.error(`Intern not found for uid ${payload.uid}`)
        return
      }
      const internData = internSnap.data()

      const today = toDateKey()
      const openAttendanceQuery = query(
        collection(db, 'attendance'),
        where('uid', '==', payload.uid),
        where('date', '==', today),
        where('status', '==', 'present'),
      )
      const openSnapshot = await getDocs(openAttendanceQuery)

      if (openSnapshot.empty) {
        await addDoc(collection(db, 'attendance'), {
          uid: payload.uid,
          name: internData.name,
          department: internData.department,
          date: today,
          entryTime: serverTimestamp(),
          exitTime: null,
          status: 'present',
        })
        const now = new Date()
        setLastScan({
          message: `Entry marked for ${internData.name}`,
          time: now,
          type: 'present',
        })
        toast.success(`Entry marked for ${internData.name} at ${now.toLocaleTimeString()}`)
      } else {
        const record = openSnapshot.docs[0]
        await updateDoc(record.ref, {
          exitTime: serverTimestamp(),
          status: 'checked-out',
        })
        const now = new Date()
        setLastScan({
          message: `Exit marked for ${internData.name}`,
          time: now,
          type: 'checked-out',
        })
        toast.success(`Exit marked for ${internData.name} at ${now.toLocaleTimeString()}`)
      }
    } catch (error) {
      toast.error(error.message || 'Attendance update failed')
    }
  }

  const onUploadQr = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadScanner = new Html5Qrcode('interntrack-upload-reader')
      const decodedText = await uploadScanner.scanFile(file, true)
      await uploadScanner.clear()
      await handleScan(decodedText)
      toast.success('QR image scanned successfully')
    } catch (error) {
      toast.error(error.message || 'Could not read QR from image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <section className="fade-up">
      <TopBar title="QR Scanner" subtitle="Scan intern QR to mark entry and exit" />

      <div className="scanner-grid">
        <article className="glass-card scanner-box">
          <div id={scannerRegionId} className="scanner-region" />
          <div id="interntrack-upload-reader" className="hidden-file-input" />
        </article>

        <article className="glass-card scanner-result">
          <h2>Last Scan Result</h2>
          <div className="upload-panel">
            <input
              ref={fileInputRef}
              id="qr-file-input"
              className="hidden-file-input"
              type="file"
              accept="image/*"
              onChange={onUploadQr}
            />
            <button
              className="btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Scanning image...' : 'Upload QR Image'}
            </button>
          </div>
          {lastScan ? (
            <div>
              <p>{lastScan.message}</p>
              <p>{formatDateTime(lastScan.time)}</p>
              <span className={`pill ${lastScan.type}`}>{lastScan.type}</span>
            </div>
          ) : (
            <p>No scan processed yet.</p>
          )}
        </article>
      </div>
    </section>
  )
}
