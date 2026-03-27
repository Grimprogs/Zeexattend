import { differenceInMinutes, format } from 'date-fns'

export const ADMIN_EMAIL = 'admin@interntrack.com'
export const BARCODE_PREFIX = 'ITK:'

export const toDateKey = (value = new Date()) => format(value, 'yyyy-MM-dd')

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '--'
  const dateValue = typeof timestamp?.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)
  return format(dateValue, 'dd MMM yyyy, hh:mm a')
}

export const formatTimeOnly = (timestamp) => {
  if (!timestamp) return '--'
  const dateValue = typeof timestamp?.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)
  return format(dateValue, 'hh:mm a')
}

export const attendanceDuration = (entryTime, exitTime) => {
  if (!entryTime || !exitTime) return '--'
  const start = typeof entryTime?.toDate === 'function' ? entryTime.toDate() : new Date(entryTime)
  const end = typeof exitTime?.toDate === 'function' ? exitTime.toDate() : new Date(exitTime)
  const minutes = Math.max(0, differenceInMinutes(end, start))
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export const buildInternQrPayload = (intern) =>
  JSON.stringify({
    uid: intern.uid,
    name: intern.name,
    email: intern.email,
    phone: intern.phone,
    department: intern.department,
  })

export const buildInternBarcodePayload = (intern) => `${intern.uid}`

export const parseQrPayload = (payload) => {
  try {
    const parsed = JSON.parse(payload)
    if (!parsed.uid || !parsed.name || !parsed.email) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const extractUidFromScan = (rawValue) => {
  const value = `${rawValue ?? ''}`.trim()
  if (!value) return null

  const qrPayload = parseQrPayload(value)
  if (qrPayload?.uid) {
    return qrPayload.uid
  }

  if (value.startsWith(BARCODE_PREFIX)) {
    const uid = value.slice(BARCODE_PREFIX.length).trim()
    return uid || null
  }

  // Allow direct UID scan from hardware scanners configured to send plain text.
  if (/^[A-Za-z0-9_-]{12,}$/.test(value)) {
    return value
  }

  return null
}

export const toCsv = (headers, rows) => {
  const esc = (value) => {
    const text = `${value ?? ''}`
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replaceAll('"', '""')}"`
    }
    return text
  }
  const headerLine = headers.map(esc).join(',')
  const rowLines = rows.map((row) => row.map(esc).join(','))
  return [headerLine, ...rowLines].join('\n')
}
