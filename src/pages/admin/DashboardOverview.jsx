import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import TopBar from '../../components/TopBar'
import { db } from '../../firebase'
import { formatTimeOnly, toDateKey, formatDateTime } from '../../utils/attendance'
import { format, subDays, parseISO } from 'date-fns'

export default function DashboardOverview() {
  const [interns, setInterns] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [allLogs, setAllLogs] = useState([])
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
        setAllLogs(allLogsSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })))
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
    const absent = interns.length - present - checkedOut
    return [
      { label: 'Total Interns', value: interns.length, color: '#6366f1' },
      { label: 'Present Today', value: present, color: '#10b981' },
      { label: 'Absent Today', value: absent, color: '#ef4444' },
      { label: 'Checked Out', value: checkedOut, color: '#f59e0b' },
    ]
  }, [allLogsCount, interns.length, todayLogs])

  const presentList = useMemo(() => {
    return todayLogs
      .filter((item) => item.status === 'present' || item.status === 'checked-out')
      .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
  }, [todayLogs])

  const absentList = useMemo(() => {
    const presentUids = new Set(todayLogs.map((log) => log.uid))
    return interns.filter((intern) => !presentUids.has(intern.uid))
  }, [todayLogs, interns])

  const dayWiseData = useMemo(() => {
    const last7Days = {}
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const dayName = format(subDays(new Date(), i), 'EEE')
      last7Days[date] = { date: dayName, present: 0, absent: 0, total: 0 }
    }

    allLogs.forEach((log) => {
      if (last7Days[log.date]) {
        if (log.status === 'present' || log.status === 'checked-out') {
          last7Days[log.date].present += 1
        }
        last7Days[log.date].total += 1
      }
    })

    Object.keys(last7Days).forEach((date) => {
      last7Days[date].absent = interns.length - last7Days[date].present
    })

    return Object.values(last7Days)
  }, [allLogs, interns.length])

  const pieData = useMemo(() => {
    const present = todayLogs.filter((item) => item.status === 'present' || item.status === 'checked-out').length
    const absent = interns.length - present
    return [
      { name: 'Present', value: present, fill: '#10b981' },
      { name: 'Absent', value: absent, fill: '#ef4444' },
    ]
  }, [todayLogs, interns.length])

  const attendanceTrend = useMemo(() => {
    const trend = {}
    allLogs.forEach((log) => {
      if (!trend[log.date]) {
        trend[log.date] = 0
      }
      if (log.status === 'present' || log.status === 'checked-out') {
        trend[log.date] += 1
      }
    })
    return Object.entries(trend)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(-30)
      .map(([date, count]) => ({
        date: format(parseISO(date), 'MMM dd'),
        attendance: count,
      }))
  }, [allLogs])

  return (
    <section className="fade-up">
      <TopBar title="Dashboard Overview" subtitle="Live attendance summary" />

      {/* Stats Grid */}
      <div className="stat-grid">
        {stats.map((item) => (
          <article key={item.label} className="glass-card stat-card" style={{ borderLeft: `4px solid ${item.color}` }}>
            <p>{item.label}</p>
            <h3 style={{ color: item.color }}>{item.value}</h3>
          </article>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Attendance Trend */}
        <article className="glass-card chart-card">
          <h3>Attendance Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        {/* Present/Absent Pie */}
        <article className="glass-card chart-card">
          <h3>Today's Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        {/* Day-wise Bar Chart */}
        <article className="glass-card chart-card full-width">
          <h3>Day-wise Attendance (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayWiseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      {/* Present and Absent Lists */}
      <div className="lists-grid">
        {/* Present List */}
        <article className="glass-card">
          <h3>✓ Present Today ({presentList.length})</h3>
          <div className="list-container">
            {presentList.length > 0 ? (
              <ul className="attendance-list">
                {presentList.map((item) => (
                  <li key={item.id} className="list-item present-item">
                    <div className="item-header">
                      <span className="item-name">{item.name}</span>
                      <span className="item-dept">{item.department}</span>
                    </div>
                    <div className="item-times">
                      <span>🕐 {formatTimeOnly(item.entryTime)}</span>
                      {item.exitTime && <span>🕑 {formatTimeOnly(item.exitTime)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No one present yet today</p>
            )}
          </div>
        </article>

        {/* Absent List */}
        <article className="glass-card">
          <h3>✗ Absent Today ({absentList.length})</h3>
          <div className="list-container">
            {absentList.length > 0 ? (
              <ul className="attendance-list">
                {absentList.map((item) => (
                  <li key={item.id} className="list-item absent-item">
                    <div className="item-header">
                      <span className="item-name">{item.name}</span>
                      <span className="item-dept">{item.department}</span>
                    </div>
                    <div className="item-email">{item.email}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">All interns are present!</p>
            )}
          </div>
        </article>
      </div>

      {/* Full Attendance Table */}
      <article className="glass-card">
        <h3>Today's Detailed Logs</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayLogs.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.department}</td>
                  <td>{formatTimeOnly(item.entryTime)}</td>
                  <td>{formatTimeOnly(item.exitTime) || '--'}</td>
                  <td>
                    <span className={`pill ${item.status}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
              {todayLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    No logs recorded today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
