import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Clock, CheckCircle2, XCircle, Check, X, Pill, Plus, Video } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Avatar from '../../components/common/Avatar'
import { doctorNav } from './doctorNav'
import { fetchDoctorDashboard, completeConsultation, fetchAcceptRequest, fetchDeclineRequest, updateConsultationPrescription, fetchDoctorSuggestsNewTime } from '../../features/appointments/appointmentsSlice'
import { timeSlots } from '../../utils/constants'



import { isAppointmentTimeReady, useTimeRefresh } from '../../utils/timeUtils'

// This page acts as the mission control for the doctor's schedule. 
// It handles upcoming appointments, pending requests, and completed visits all in one place.
export default function DoctorAppointments() {
  const dispatch = useDispatch()
  
  // Pull all the different categories of appointments from Redux
  const { today, pending, completed } = useSelector((s) => s.appointments.doctor)
  
  // These state variables control which pop-up modal is currently visible on the screen.
  // When they are set to null, the modal is hidden. When set to an object, the modal opens for that specific appointment/patient.
  const [historyModalPatient, setHistoryModalPatient] = useState(null)
  const [detailsModalAppt, setDetailsModalAppt] = useState(null)
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null)
  
  // Temporary state to hold the form data when a doctor suggests a new time for a pending request
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', message: '' })
  
  // Temporary state for the prescription builder inside the consultation summary modal
  const [newPrescription, setNewPrescription] = useState('')
  const [prescriptions, setPrescriptions] = useState([])

  // Custom hook that forces the component to check the time every minute, ensuring the "Start Consultation" buttons activate properly
  useTimeRefresh()

  // Grab the freshest appointment data from the backend when this page first loads
  useEffect(() => { dispatch(fetchDoctorDashboard()) }, [dispatch])

  // Triggers when the doctor is ready to see the patient
  const handleStartConsultation = (t) => {
    dispatch(completeConsultation(t));
    if (t.meetLink) {
      window.open(t.meetLink, '_blank');
    } else {
      alert('No specific Google Meet link was generated for this appointment. You may need to connect your Google Calendar in Profile Settings. Redirecting to Google Meet home page.');
      window.open('https://meet.google.com', '_blank');
    }
  }

  return (
    <DashboardLayout badge="Doctor" navItems={doctorNav}>
      <h1 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Appointment Management</h1>

      {/* SECTION 1: UPCOMING APPOINTMENTS */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 fw-bold mb-4" style={{ color: '#0f172a' }}>Upcoming Appointments</h2>
        <div className="d-flex flex-column gap-3">
          {today.map((t) => (
            <div key={t.id} className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-3 border bg-white" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-3">
                <Avatar />
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{t.name}</div>
                  <div className="small mt-1" style={{ color: '#64748b' }}>{t.age} years • {t.type}</div>
                  <div className="d-flex align-items-center gap-1 small mt-1" style={{ color: '#94a3b8' }}><Clock size={12} /> {t.time}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm px-4 py-2 rounded-3 fw-bold border border-2" style={{ color: '#2563eb', borderColor: '#2563eb', backgroundColor: 'transparent' }} onClick={() => setHistoryModalPatient(t)}>View History</button>
                {isAppointmentTimeReady(t.date || new Date().toISOString().split('T')[0], t.time) ? (
                  <button 
                    className="btn btn-primary btn-sm px-4 py-2 rounded-3 fw-bold border border-2 border-primary d-flex align-items-center gap-2" 
                    style={{ backgroundColor: '#16a34a', borderColor: '#15803d' }} 
                    onClick={() => handleStartConsultation(t)}
                  >
                    <Video size={16} /> Start Consultation
                  </button>
                ) : (
                  <button 
                    className="btn btn-sm px-4 py-2 rounded-3 fw-bold border border-2 d-flex align-items-center gap-2 disabled" 
                    style={{ backgroundColor: '#94a3b8', borderColor: '#94a3b8', color: '#fff' }}
                  >
                    <Video size={16} /> Start Consultation
                  </button>
                )}
              </div>
            </div>
          ))}
          {today.length === 0 && <div className="small text-secondary">No upcoming appointments.</div>}
        </div>
      </div>

      {/* SECTION 2: PENDING REQUESTS (Appointments waiting for doctor approval) */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 fw-bold mb-4" style={{ color: '#0f172a' }}>Pending Requests</h2>
        <div className="d-flex flex-column gap-4">
          {pending.map((p) => (
            <div key={p.id} className="rounded-3 border p-4" style={{ borderColor: '#fde68a', backgroundColor: '#fefce8' }}>
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                  <Avatar color="yellow" />
                  <div>
                    <div className="fw-bold" style={{ color: '#1e293b' }}>{p.name}</div>
                    <div className="small" style={{ color: '#64748b' }}>{p.age} years</div>
                  </div>
                </div>
                <div className="text-end small" style={{ color: '#64748b' }}><div>{p.date}</div><div>{p.time}</div></div>
              </div>
              <div className="rounded-3 p-3 small mb-3 bg-white">
                <div style={{ color: '#64748b' }}>Reason for visit:</div>
                <div style={{ color: '#1e293b' }}>{p.reason}</div>
              </div>
              <div className="row g-2">
                <div className="col-12 col-sm-4">
                  <button onClick={() => dispatch(fetchAcceptRequest(p.id))} className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold border-0 text-white" style={{ backgroundColor: '#16a34a' }}><Check size={15} /> Accept Request</button>
                </div>
                <div className="col-12 col-sm-4">
                  <button onClick={() => setRescheduleModalAppt(p)} className="btn w-100 py-2 rounded-3 fw-bold border-0 text-white" style={{ backgroundColor: '#f59e0b' }}>Suggest Different Time</button>
                </div>
                <div className="col-12 col-sm-4">
                  <button onClick={() => dispatch(fetchDeclineRequest(p.id))} className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold border-0 text-white" style={{ backgroundColor: '#ef4444' }}><XCircle size={15} /> Decline</button>
                </div>
              </div>
            </div>
          ))}
          {pending.length === 0 && <div className="small text-secondary">No pending requests.</div>}
        </div>
      </div>

      {/* SECTION 3: COMPLETED CONSULTATIONS (Past visits) */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 fw-bold mb-4" style={{ color: '#0f172a' }}>Completed Consultations</h2>
        <div className="d-flex flex-column gap-3">
          {completed.map((c) => (
            <div key={c.id} className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-3 border" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
              <div className="d-flex align-items-center gap-3">
                <Avatar color="green" icon={CheckCircle2} />
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{c.name}</div>
                  <div className="small mt-1" style={{ color: '#64748b' }}>{c.age} years • {c.time}</div>
                  <div className="small mt-1" style={{ color: '#64748b' }}>Diagnosis: {c.diagnosis}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="badge rounded-pill fw-bold" style={{ backgroundColor: c.prescription ? '#dbeafe' : '#f1f5f9', color: c.prescription ? '#2563eb' : '#64748b', padding: '6px 12px' }}>
                  Prescription: {c.prescription ? 'Yes' : 'No'}
                </span>
                <button className="btn btn-sm px-4 py-2 rounded-3 fw-bold border border-2" style={{ color: '#2563eb', borderColor: '#2563eb', backgroundColor: 'transparent' }} onClick={() => {
                  setDetailsModalAppt(c); 
                  setPrescriptions(c.prescriptions || []);
                }}>View Details</button>
              </div>
            </div>
          ))}
          {completed.length === 0 && <div className="small text-secondary">No completed consultations yet.</div>}
        </div>
      </div>

      {/* History Modal */}
      {historyModalPatient && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-100 bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4" style={{ borderColor: '#f1f5f9' }}>
              <h2 className="h5 fw-bold m-0" style={{ color: '#0f172a' }}>Patient History</h2>
              <button onClick={() => setHistoryModalPatient(null)} className="btn btn-sm border-0 p-0 text-secondary">
                <X size={24} />
              </button>
            </div>
            
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-center gap-3">
                <Avatar size={48} />
                <div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{historyModalPatient.name}</div>
                  <div className="small" style={{ color: '#64748b' }}>{historyModalPatient.age} years • Blood Type: O+</div>
                  <div className="small" style={{ color: '#94a3b8' }}>Allergies: Penicillin, Peanuts</div>
                </div>
              </div>

              <div>
                <h3 className="h6 fw-semibold" style={{ color: '#334155' }}>Past Consultations</h3>
                <div className="d-flex flex-column gap-3 mt-3">
                  <div className="rounded-3 border p-3 small" style={{ borderColor: '#e2e8f0' }}>
                    <div className="d-flex justify-content-between fw-bold mb-1" style={{ color: '#1e293b' }}>
                      <span>General Checkup</span>
                      <span style={{ color: '#64748b' }}>2 months ago</span>
                    </div>
                    <div style={{ color: '#475569' }}>Diagnosis: Healthy, advised vitamin D supplements.</div>
                  </div>
                  <div className="rounded-3 border p-3 small" style={{ borderColor: '#e2e8f0' }}>
                    <div className="d-flex justify-content-between fw-bold mb-1" style={{ color: '#1e293b' }}>
                      <span>Fever & Cough</span>
                      <span style={{ color: '#64748b' }}>8 months ago</span>
                    </div>
                    <div style={{ color: '#475569' }}>Diagnosis: Viral Infection. Prescribed rest and fluids.</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 d-flex justify-content-end">
              <button className="btn btn-outline-secondary rounded-3 fw-bold px-4" onClick={() => setHistoryModalPatient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Prescription Modal */}
      {detailsModalAppt && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-100 bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4" style={{ borderColor: '#f1f5f9' }}>
              <h2 className="h5 fw-bold m-0" style={{ color: '#0f172a' }}>Consultation Summary</h2>
              <button onClick={() => setDetailsModalAppt(null)} className="btn btn-sm border-0 p-0 text-secondary">
                <X size={24} />
              </button>
            </div>
            
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-center gap-3">
                <Avatar size={48} />
                <div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{detailsModalAppt.name}</div>
                  <div className="small" style={{ color: '#64748b' }}>{detailsModalAppt.age} years</div>
                  <div className="small" style={{ color: '#94a3b8' }}>{detailsModalAppt.time} • Completed</div>
                </div>
              </div>

              <div>
                <h3 className="h6 fw-semibold" style={{ color: '#334155' }}>Diagnosis & Notes</h3>
                <div className="mt-2 rounded-3 p-3 small" style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                  <span className="fw-bold d-block mb-1">Diagnosis: {detailsModalAppt.diagnosis || 'No diagnosis provided.'}</span>
                </div>
              </div>

              <div>
                <h3 className="h6 fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                  <Pill size={16} /> Manage Prescriptions
                </h3>
                
                <div className="d-flex gap-2 mb-3">
                  <div className="flex-grow-1">
                    <input 
                      type="text"
                      className="form-control rounded-3 border"
                      placeholder="Medication name and dosage..." 
                      value={newPrescription} 
                      onChange={(e) => setNewPrescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPrescription.trim()) {
                          setPrescriptions([...prescriptions, newPrescription.trim()]);
                          setNewPrescription('');
                        }
                      }}
                    />
                  </div>
                  <button 
                    className="btn btn-primary rounded-3 fw-bold px-4 d-flex align-items-center gap-1"
                    style={{ backgroundColor: '#2563EB', borderColor: '#1d4ed8' }}
                    onClick={() => {
                      if (newPrescription.trim()) {
                        setPrescriptions([...prescriptions, newPrescription.trim()]);
                        setNewPrescription('');
                      }
                    }}
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>

                <div className="rounded-3 border p-3" style={{ borderColor: '#e2e8f0' }}>
                  {prescriptions.length > 0 ? (
                    <ul className="list-unstyled m-0 d-flex flex-column gap-2">
                      {prescriptions.map((rx, idx) => (
                        <li key={idx} className="d-flex align-items-center justify-content-between small px-3 py-2 rounded-3" style={{ backgroundColor: '#f8fafc', color: '#334155' }}>
                          <span>{rx}</span>
                          <button 
                            className="btn btn-sm border-0 p-0 text-danger"
                            onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="small fst-italic" style={{ color: '#64748b' }}>No prescriptions added yet.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 d-flex justify-content-end gap-2 border-top pt-3" style={{ borderColor: '#f1f5f9' }}>
              <button className="btn btn-outline-secondary rounded-3 fw-bold px-4" onClick={() => setDetailsModalAppt(null)}>Cancel</button>
              <button className="btn btn-primary rounded-3 fw-bold px-4" style={{ backgroundColor: '#2563EB', borderColor: '#1d4ed8' }} onClick={() => {
                dispatch(updateConsultationPrescription({ id: detailsModalAppt.id, prescriptions }));
                setDetailsModalAppt(null);
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-100 bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '400px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4" style={{ borderColor: '#f1f5f9' }}>
              <h2 className="h5 fw-bold m-0" style={{ color: '#0f172a' }}>Reschedule Appointment</h2>
              <button onClick={() => setRescheduleModalAppt(null)} className="btn btn-sm border-0 p-0 text-secondary">
                <X size={24} />
              </button>
            </div>
            
            <div className="d-flex flex-column gap-3">
              <div className="rounded-3 p-3 small" style={{ backgroundColor: '#fffbeb', color: '#92400e' }}>
                You are suggesting a new time for <span className="fw-bold">{rescheduleModalAppt.name}</span>.
              </div>
              
              <div>
                <label className="mb-1 d-block small fw-bold" style={{ color: '#334155' }}>New Date</label>
                <input 
                  type="date" 
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  className="form-control rounded-3 border px-3 py-2 small" 
                />
              </div>

              <div>
                <label className="mb-1 d-block small fw-bold" style={{ color: '#334155' }}>New Time Slot</label>
                <select 
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                  className="form-select rounded-3 border px-3 py-2 small"
                >
                  <option value="">Select a time...</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 d-block small fw-bold" style={{ color: '#334155' }}>Message to Patient</label>
                <textarea 
                  rows={3} 
                  placeholder="Explain why you are rescheduling..."
                  value={rescheduleData.message}
                  onChange={(e) => setRescheduleData({...rescheduleData, message: e.target.value})}
                  className="form-control rounded-3 border px-3 py-2 small"
                />
              </div>
            </div>
            
            <div className="mt-4 d-flex justify-content-end gap-2 border-top pt-3" style={{ borderColor: '#f1f5f9' }}>
              <button className="btn btn-outline-secondary rounded-3 fw-bold px-4" onClick={() => setRescheduleModalAppt(null)}>Cancel</button>
              <button 
                className="btn btn-primary rounded-3 fw-bold px-4" 
                style={!rescheduleData.date || !rescheduleData.time ? { backgroundColor: '#94a3b8', borderColor: '#94a3b8' } : { backgroundColor: '#2563EB', borderColor: '#1d4ed8' }}
                disabled={!rescheduleData.date || !rescheduleData.time}
                onClick={() => {
                  dispatch(fetchDoctorSuggestsNewTime({
                    id: rescheduleModalAppt.id,
                    newDate: rescheduleData.date,
                    newTime: rescheduleData.time,
                    reason: rescheduleModalAppt.reason,
                    patientName: rescheduleModalAppt.name,
                    patientAge: rescheduleModalAppt.age
                  }));
                  setRescheduleModalAppt(null);
                  setRescheduleData({ date: '', time: '', message: '' });
                }}
              >
                Suggest Time
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
