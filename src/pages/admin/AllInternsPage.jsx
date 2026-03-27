import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import TopBar from '../../components/TopBar'
import { db } from '../../firebase'
import { formatDateTime, formatTimeOnly } from '../../utils/attendance'

export default function AllInternsPage() {
  const [interns, setInterns] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedLogs, setSelectedLogs] = useState([])

  useEffect(() => {
    const loadInterns = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'interns'), orderBy('createdAt', 'desc')))
        setInterns(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
      } catch (error) {
        toast.error(error.message || 'Could not fetch interns')
      }
    }

    loadInterns()
  }, [])

  const openIntern = async (intern) => {
    setSelected(intern)
    try {
      const logsSnapshot = await getDocs(
        query(collection(db, 'attendance'), where('uid', '==', intern.uid), orderBy('entryTime', 'desc')),
      )
      setSelectedLogs(logsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
    } catch {
      setSelectedLogs([])
    }
  }

  return (
    <section className="fade-up">
      <TopBar title="All Interns" subtitle="Click any intern to view profile and history" />

      <article className="glass-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern) => (
                <tr key={intern.uid}>
                  <td>{intern.name}</td>
                  <td>{intern.email}</td>
                  <td>{intern.phone}</td>
                  <td>{intern.department}</td>
                  <td>{formatDateTime(intern.createdAt)}</td>
                  <td>
                    <button className="btn-ghost" onClick={() => openIntern(intern)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card glass-card" onClick={(event) => event.stopPropagation()}>
            <h2>{selected.name}</h2>
            <p>{selected.email}</p>
            <p>{selected.phone}</p>
            <p>{selected.department}</p>

            <h3>Attendance History</h3>
            <div className="table-wrap compact">
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
                  {selectedLogs.map((logItem) => (
                    <tr key={logItem.id}>
                      <td>{logItem.date}</td>
                      <td>{formatTimeOnly(logItem.entryTime)}</td>
                      <td>{formatTimeOnly(logItem.exitTime)}</td>
                      <td>
                        <span className={`pill ${logItem.status}`}>{logItem.status}</span>
                      </td>
                    </tr>
                  ))}
                  {selectedLogs.length === 0 && (
                    <tr>
                      <td colSpan={4}>No logs available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button className="btn-secondary" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
