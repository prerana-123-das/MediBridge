import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Clock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { doctorNav } from './doctorNav'
import { fetchDoctorAvailability, updateDoctorAvailability } from '../../features/doctors/doctorsSlice'

// A small reusable iOS-style toggle switch component used for the morning/afternoon slots.
// It handles its own visual state based on the 'on' and 'disabled' props passed to it.
function Toggle({ on, onClick, disabled }) {
  return (
    <button 
      type="button" 
      className={`toggle border-0 p-0 ${disabled ? 'opacity-50 pe-none grayscale' : ''}`} 
      data-on={disabled ? false : on} 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span />
    </button>
  )
}

// The Manage Schedule page where doctors can set which days and times they are available for appointments.
export default function ManageSchedule() {
  const dispatch = useDispatch()
  
  // Grab the logged-in doctor and their current availability schedule from Redux
  const user = useSelector(s => s.auth.user)
  const availability = useSelector(s => s.doctors.availability)

  // Local state to track the week's schedule before the user clicks 'Save Changes'
  const [days, setDays] = useState([])
  // A quick flag to show the "✓ Saved Successfully" message temporarily
  const [isSaved, setIsSaved] = useState(false)

  // When the page first loads (or if the user changes), fetch their saved schedule from the backend
  useEffect(() => {
    const doctorId = user?.doctorId || user?.id
    if (doctorId) {
      dispatch(fetchDoctorAvailability(doctorId))
    }
  }, [dispatch, user])

  // Whenever we receive new availability data from Redux, map it into a clean 7-day array
  // so we can easily loop through it to draw the UI.
  useEffect(() => {
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => {
      const found = availability?.find(a => a.dayOfWeek === d)
      return {
        day: d,
        available: found ? found.isAvailable : false,
        morning: found ? found.morningAvailable : false,
        afternoon: found ? found.afternoonAvailable : false,
      }
    })
    setDays(defaultDays)
  }, [availability])

  // A generic handler that flips a boolean value (true -> false or false -> true)
  // for a specific day index and a specific key (like 'available' or 'morning')
  const update = (i, key) => {
    setDays((p) => p.map((d, idx) => (idx === i ? { ...d, [key]: !d[key] } : d)))
    setIsSaved(false) // Hide the success message if they start editing again
  }

  // Packages the local 'days' state back into the format the backend expects and saves it
  const handleSave = () => {
    const payload = days.map(d => ({
      dayOfWeek: d.day,
      isAvailable: d.available,
      morningAvailable: d.morning,
      afternoonAvailable: d.afternoon
    }))
    dispatch(updateDoctorAvailability(payload))
    
    // Show the green success button for exactly 3 seconds, then flip it back to normal
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <DashboardLayout badge="Doctor" navItems={doctorNav}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 mb-4">
        <div>
          <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Manage Schedule</h1>
          <p className="mt-1 mb-0 small" style={{ color: '#64748b' }}>Set your availability for appointments</p>
        </div>
        <button 
          onClick={handleSave} 
          className="btn btn-primary px-4 py-2 rounded-3 fw-bold border-0"
          style={isSaved ? { backgroundColor: '#22c55e' } : { backgroundColor: '#2563EB' }}
        >
          {isSaved ? '✓ Saved Successfully' : 'Save Changes'}
        </button>
      </div>

      <div className="d-flex flex-column gap-3">
        {days.map((d, i) => (
          <div key={d.day} className="card rounded-4 p-4 shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="fw-bold" style={{ color: '#0f172a' }}>{d.day}</div>
              <label className="d-flex align-items-center gap-2 small fw-bold m-0" style={{ color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" checked={d.available} onChange={() => update(i, 'available')}
                  style={{ width: '16px', height: '16px', accentColor: '#9333ea', cursor: 'pointer' }} /> Available
              </label>
            </div>
            <div className={`row g-3 transition-opacity ${!d.available ? 'opacity-50 pe-none' : ''}`}>
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center justify-content-between rounded-3 p-3" style={{ backgroundColor: '#f8fafc' }}>
                  <span className="d-flex align-items-center gap-2 small fw-medium" style={{ color: '#64748b' }}>
                    <Clock size={16} style={{ color: '#94a3b8' }} /> 09:00 AM - 12:00 PM
                  </span>
                  <Toggle on={d.morning} onClick={() => update(i, 'morning')} disabled={!d.available} />
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center justify-content-between rounded-3 p-3" style={{ backgroundColor: '#f8fafc' }}>
                  <span className="d-flex align-items-center gap-2 small fw-medium" style={{ color: '#64748b' }}>
                    <Clock size={16} style={{ color: '#94a3b8' }} /> 02:00 PM - 05:00 PM
                  </span>
                  <Toggle on={d.afternoon} onClick={() => update(i, 'afternoon')} disabled={!d.available} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
