import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import toast from 'react-hot-toast'
import TopBar from '../../components/TopBar'
import { db } from '../../firebase'
import { attendanceDuration, formatDateTime, formatTimeOnly, toCsv } from '../../utils/attendance'

export default function AttendanceLogsPage() {
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState({ date: '', department: '', status: '' })

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'attendance'), orderBy('entryTime', 'desc')))
        setLogs(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
      } catch (error) {
        toast.error(error.message || 'Could not fetch attendance logs')
      }
    }

    loadLogs()
  }, [])

  const departments = useMemo(() => [...new Set(logs.map((item) => item.department).filter(Boolean))], [logs])

  const filteredLogs = useMemo(
    () =>
      logs.filter((item) => {
        if (filters.date && item.date !== filters.date) return false
        if (filters.department && item.department !== filters.department) return false
        if (filters.status && item.status !== filters.status) return false
        return true
      }),
    [filters, logs],
  )

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const exportCsv = () => {
    const csv = toCsv(
      ['Name', 'Department', 'Date', 'Entry Time', 'Exit Time', 'Duration', 'Status'],
      filteredLogs.map((item) => [
        item.name,
        item.department,
        item.date,
        formatDateTime(item.entryTime),
        formatDateTime(item.exitTime),
        attendanceDuration(item.entryTime, item.exitTime),
        item.status,
      ]),
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `attendance_logs_${Date.now()}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="fade-up">
      <TopBar
        title="Attendance Logs"
        subtitle="Filter attendance by date, department, and status"
        actions={
          <button className="btn-primary" onClick={exportCsv}>
            Export CSV
          </button>
        }
      />

      <article className="glass-card filter-row">
        <label>
          Date
          <input type="date" name="date" value={filters.date} onChange={updateFilter} />
        </label>
        <label>
          Department
          <select name="department" value={filters.department} onChange={updateFilter}>
            <option value="">All</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="checked-out">Checked Out</option>
          </select>
        </label>
      </article>

      <article className="glass-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.department}</td>
                  <td>{item.date}</td>
                  <td>{formatTimeOnly(item.entryTime)}</td>
                  <td>{formatTimeOnly(item.exitTime)}</td>
                  <td>{attendanceDuration(item.entryTime, item.exitTime)}</td>
                  <td>
                    <span className={`pill ${item.status}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7}>No attendance logs found for selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
