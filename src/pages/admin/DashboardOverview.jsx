import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import TopBar from '../../components/TopBar'
import { db } from '../../firebase'
import { formatTimeOnly, toDateKey } from '../../utils/attendance'

export default function DashboardOverview() {
  const [interns, setInterns] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [allLogsCount, setAllLogsCount] = useState(0)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const today = toDateKey()
        const internsSnapshot = await getDocs(query(collection(db, 'interns'), orderBy('createdAt', 'desc')))
        const todaySnapshot = await getDocs(
          query(collection(db, 'attendance'), where('date', '==', today), orderBy('entryTime', 'desc')),
        )
        const allLogsSnapshot = await getDocs(collection(db, 'attendance'))

        setInterns(internsSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })))
        setTodayLogs(todaySnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })))
        setAllLogsCount(allLogsSnapshot.size)
      } catch (error) {
        toast.error(error.message || 'Could not load dashboard')
      }
    }

    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const present = todayLogs.filter((item) => item.status === 'present').length
    const checkedOut = todayLogs.filter((item) => item.status === 'checked-out').length
    return [
      { label: 'Total Interns Registered', value: interns.length },
      { label: 'Present Today', value: present },
      { label: 'Checked Out Today', value: checkedOut },
      { label: 'Total Attendance Logs', value: allLogsCount },
    ]
  }, [allLogsCount, interns.length, todayLogs])

  return (
    <section className="fade-up">
      <TopBar title="Dashboard Overview" subtitle="Live attendance summary for today" />

      <div className="stat-grid">
        {stats.map((item) => (
          <article key={item.label} className="glass-card stat-card">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </div>

      <article className="glass-card">
        <h2>Today's Attendance</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayLogs.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{formatTimeOnly(item.entryTime)}</td>
                  <td>{formatTimeOnly(item.exitTime)}</td>
                  <td>
                    <span className={`pill ${item.status}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
              {todayLogs.length === 0 && (
                <tr>
                  <td colSpan={4}>No logs recorded today yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
