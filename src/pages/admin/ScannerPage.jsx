import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
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
import { extractUidFromScan, formatDateTime, toDateKey } from '../../utils/attendance'

export default function ScannerPage() {
  const scannerRegionId = 'interntrack-scanner'
  const scannerRef = useRef(null)
  const scannerStartedRef = useRef(false)
  const fileInputRef = useRef(null)
  const isProcessingRef = useRef(false)
  const [lastScan, setLastScan] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [machineValue, setMachineValue] = useState('')
  const [scanMode, setScanMode] = useState('qr')

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerRegionId)
    scannerRef.current = scanner

    const modeFormats =
      scanMode === 'barcode'
        ? [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
          ]
        : [Html5QrcodeSupportedFormats.QR_CODE]

    const modeQrBox =
      scanMode === 'barcode'
        ? { width: 360, height: 140 }
        : { width: 260, height: 260 }

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: modeQrBox,
            formatsToSupport: modeFormats,
          },
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
  }, [scanMode])

  const handleScan = async (decodedText) => {
    const uid = extractUidFromScan(decodedText)
    if (!uid) {
      toast.error('Invalid QR/Barcode payload')
      return
    }

    try {
      const internSnap = await getDoc(doc(db, 'interns', uid))
      if (!internSnap.exists()) {
        toast.error(`Intern not found for uid ${uid}`)
        return
      }
      const internData = internSnap.data()

      const today = toDateKey()
      const openAttendanceQuery = query(
        collection(db, 'attendance'),
        where('uid', '==', uid),
        where('date', '==', today),
        where('status', '==', 'present'),
      )
      const openSnapshot = await getDocs(openAttendanceQuery)

      if (openSnapshot.empty) {
        await addDoc(collection(db, 'attendance'), {
          uid,
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
      toast.success('QR/Barcode image scanned successfully')
    } catch (error) {
      toast.error(error.message || 'Could not read QR from image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const onMachineSubmit = async (event) => {
    event.preventDefault()
    if (!machineValue.trim()) return
    await handleScan(machineValue.trim())
    setMachineValue('')
  }

  return (
    <section className="fade-up">
      <TopBar title="QR/Barcode Scanner" subtitle="Use camera, upload, or scanner machine input" />

      <div className="scanner-grid">
        <article className="glass-card scanner-box">
          <div className="scan-mode-switch">
            <button
              className={`btn-ghost ${scanMode === 'qr' ? 'active-scan-mode' : ''}`}
              onClick={() => setScanMode('qr')}
            >
              Camera QR Mode
            </button>
            <button
              className={`btn-ghost ${scanMode === 'barcode' ? 'active-scan-mode' : ''}`}
              onClick={() => setScanMode('barcode')}
            >
              Camera Barcode Mode
            </button>
          </div>
          <div id={scannerRegionId} className="scanner-region" />
          <div id="interntrack-upload-reader" className="hidden-file-input" />
        </article>

        <article className="glass-card scanner-result">
          <h2>Last Scan Result</h2>
          <form className="machine-form" onSubmit={onMachineSubmit}>
            <label htmlFor="machine-input">Machine Scanner Input</label>
            <input
              id="machine-input"
              type="text"
              placeholder="Scan barcode here and press Enter"
              value={machineValue}
              onChange={(event) => setMachineValue(event.target.value)}
            />
            <button className="btn-secondary" type="submit">
              Process Code
            </button>
          </form>

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
              {uploading ? 'Scanning image...' : 'Upload QR/Barcode Image'}
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
