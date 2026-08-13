import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, CheckCircle2, Users } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { doctorNav } from './doctorNav'
import { fetchDoctorDashboard, completeConsultation } from '../../features/appointments/appointmentsSlice'
import { isAppointmentTimeReady, useTimeRefresh } from '../../utils/timeUtils'

// The main landing page for doctors when they log in. 
// It shows their daily stats and a list of today's appointments.
export default function DoctorOverview() {
  const dispatch = useDispatch()
  
  // Grab the logged-in doctor's profile details from Redux
  const user = useSelector((s) => s.auth.user)
  // Pull the doctor's specific appointment data from Redux
  const { today, pending, completed, patientRecords } = useSelector((s) => s.appointments.doctor)
  
  // Custom hook that triggers a re-render every minute so the "Start Consultation" buttons activate exactly on time
  useTimeRefresh()
  
  // Fetch the latest dashboard data from the backend as soon as this page loads
  useEffect(() => { dispatch(fetchDoctorDashboard()) }, [dispatch])

  // Calculate the numbers to display in the big colorful stat cards at the top
  const upcomingCount = today?.length || 0
  const todayStr = new Date().toISOString().split('T')[0]
  const completedTodayCount = (completed || []).filter(a => a.date === todayStr).length
  const totalPatientsCount = patientRecords?.length || 0

  // Configuration for the stat cards (icon, number, text, and gradient colors)
  const stats = [
    { icon: Calendar, value: upcomingCount, label: "Upcoming Appointments", colors: ['#3b82f6', '#2563eb'] },
    { icon: CheckCircle2, value: completedTodayCount, label: 'Completed Today', colors: ['#22c55e', '#16a34a'] },
    { icon: Users, value: totalPatientsCount, label: 'Total Patients', colors: ['#a855f7', '#9333ea'] },
  ]

  // Extract just the last name of the doctor to say "Welcome, Johnson!" instead of their full name
  const lastName = (user?.name || 'Dr. Johnson').split(' ').slice(-1)[0]

  return (
    <DashboardLayout badge="Doctor" navItems={doctorNav}>
      <h1 className="fw-bolder mb-1" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Welcome, {lastName}!</h1>
      <p className="text-secondary m-0 mb-4">Here's your overview for today</p>

      {/* The 3 colorful stat cards at the top (Upcoming, Completed, Total Patients) */}
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="col-12 col-sm-6 col-lg-4">
            <div className="rounded-4 p-4 text-white shadow-sm" style={{ background: `linear-gradient(to bottom right, ${s.colors[0]}, ${s.colors[1]})` }}>
              <s.icon size={24} style={{ opacity: 0.9 }} />
              <div className="mt-4 fw-bolder" style={{ fontSize: '1.875rem', lineHeight: 1 }}>{s.value}</div>
              <div className="mt-2 small" style={{ color: 'rgba(255,255,255,0.9)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* The main list of today's upcoming appointments */}
      <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 fw-bold mb-4" style={{ color: '#0f172a' }}>Upcoming Schedule</h2>
        <div className="d-flex flex-column gap-3">
          {/* Loop through today's appointments and render a row for each one */}
          {today.map((t) => (
            <div key={t.id} className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-3 border bg-white" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-4">
                <div className="rounded-3 px-3 py-2 text-center" style={{ backgroundColor: '#eff6ff' }}>
                  <div className="text-uppercase fw-bold" style={{ fontSize: '10px', color: '#94a3b8' }}>Time</div>
                  <div className="fw-bold" style={{ fontSize: '0.875rem', color: '#2563eb' }}>{t.time}</div>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{t.name}</div>
                  <div className="small mt-1" style={{ color: '#64748b' }}>{t.age} years • {t.type}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="badge rounded-pill fw-bold" style={{ 
                  color: t.status === 'Confirmed' ? '#0d9488' : '#b45309',
                  backgroundColor: t.status === 'Confirmed' ? '#e6f4ea' : '#fef08a',
                  padding: '6px 12px'
                }}>
                  {t.status}
                </span>
                
                {/* 
                  Only let the doctor click "Start Consultation" if the current time has actually reached the appointment time.
                  Otherwise, show a greyed out, disabled button. 
                */}
                {isAppointmentTimeReady(t.date || new Date().toISOString().split('T')[0], t.time) ? (
                  <button 
                    onClick={() => {
                      // Mark it as complete in Redux
                      dispatch(completeConsultation(t));
                      // Open the Google Meet link in a new tab
                      if (t.meetLink) {
                        window.open(t.meetLink, '_blank');
                      } else {
                        // Fallback if there's no specific meeting link
                        alert('No specific Google Meet link was generated for this appointment. You may need to connect your Google Calendar in Profile Settings. Redirecting to Google Meet home page.');
                        window.open('https://meet.google.com', '_blank');
                      }
                    }}
                    className="btn btn-primary btn-sm px-4 py-2 rounded-3 fw-bold border border-2 border-primary"
                    style={{ backgroundColor: '#16a34a', borderColor: '#15803d' }}
                  >
                    Start Consultation
                  </button>
                ) : (
                  <button 
                    className="btn btn-sm px-4 py-2 rounded-3 fw-bold border border-2 disabled"
                    style={{ backgroundColor: '#94a3b8', borderColor: '#94a3b8', color: '#fff' }}
                  >
                    Start Consultation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
