import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Clock, X, FileText, Pill, User, Video } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { patientNav } from './patientNav'
import { fetchPatientAppointments, cancelAppointment, reschedulePatientAppointment, fetchPatientAcceptsSuggestedTime, fetchPatientRejectsSuggestedTime } from '../../features/appointments/appointmentsSlice'
import { timeSlots } from '../../utils/constants'



import { isAppointmentTimeReady, useTimeRefresh } from '../../utils/timeUtils'

export default function PatientAppointments() {
  const dispatch = useDispatch()
  const { upcoming, past } = useSelector((s) => s.appointments.patient)
  const [selectedPastAppt, setSelectedPastAppt] = useState(null)
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', message: '' })

  useTimeRefresh()

  useEffect(() => { dispatch(fetchPatientAppointments()) }, [dispatch])

  const handleDownload = (filename) => {
    const element = document.createElement("a")
    const fileBlob = new Blob([`Mock document contents for ${filename}\nGenerated securely from MediBridge System.`], {type: 'text/plain'})
    element.href = URL.createObjectURL(fileBlob)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleJoinConsultation = () => {
    // In a real app, this would redirect to Google Meet or an internal video room
    alert('Starting video consultation through Google Meet...');
  }

  return (
    <DashboardLayout navItems={patientNav}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>My Appointments</h1>
        <Link to="/patient/book" className="btn fw-bold text-white rounded-3 shadow-sm px-4 py-2" style={{ backgroundColor: '#2563EB', fontSize: '0.9rem' }}>
          Book New Appointment
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="h6 fw-bolder mb-4" style={{ color: '#0f172a' }}>Upcoming</h2>
        <div className="d-flex flex-column gap-3">
          {upcoming.map((a) => (
            <div key={a.appointment_id} className="d-flex flex-wrap align-items-center justify-content-between gap-3 rounded-4 p-3 border" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563EB' }}>
                  <User size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{a.doctor}</div>
                  <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{a.specialization}</div>
                  <div className="mt-1 d-flex align-items-center gap-3 small fw-semibold" style={{ color: '#94a3b8' }}>
                    <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {a.appointment_date}</span>
                    <span className="d-flex align-items-center gap-1"><Clock size={14} /> {a.time}</span>
                  </div>
                  {a.status === 'Cancelled' && (
                    <div className="mt-2 small fw-bold text-danger">
                      Your refund has been initiated and will reflect in 3-5 business days.
                    </div>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                {a.status?.toLowerCase() === 'confirmed' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#e6f4ea', color: '#0d9488', padding: '6px 12px' }}>Confirmed</span>}
                {a.status?.toLowerCase() === 'pending' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fef08a', color: '#b45309', padding: '6px 12px' }}>Pending</span>}
                {a.status?.toLowerCase() === 'suggested' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px' }}>Reschedule Suggested</span>}
                {a.status?.toLowerCase() === 'cancelled' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '6px 12px' }}>Cancelled</span>}
                {a.status?.toLowerCase() !== 'confirmed' && a.status?.toLowerCase() !== 'pending' && a.status?.toLowerCase() !== 'suggested' && a.status?.toLowerCase() !== 'cancelled' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px' }}>{a.status}</span>}

                {a.status?.toLowerCase() === 'suggested' ? (
                  <>
                    <button 
                      className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2" 
                      style={{ backgroundColor: '#16a34a' }} 
                      onClick={() => dispatch(fetchPatientAcceptsSuggestedTime(a.appointment_id))}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-sm fw-bold rounded-3 px-3 py-2" 
                      style={{ border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent' }} 
                      onClick={() => dispatch(fetchPatientRejectsSuggestedTime(a.appointment_id))}
                    >
                      Reject
                    </button>
                  </>
                ) : a.status?.toLowerCase() === 'confirmed' ? (
                  <>
                    <button 
                      className="btn btn-sm fw-bold rounded-3 px-3 py-2" 
                      style={{ border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent' }} 
                      onClick={() => dispatch(cancelAppointment(a.appointment_id))}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2" 
                      style={{ backgroundColor: '#2563EB' }} 
                      onClick={() => setRescheduleModalAppt(a)}
                    >
                      Reschedule
                    </button>
                    {isAppointmentTimeReady(a.appointment_date, a.time) ? (
                      <button 
                        className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2 d-flex align-items-center gap-1" 
                        style={{ backgroundColor: '#16a34a' }} 
                        onClick={() => {
                          if (a.meetLink) {
                            window.open(a.meetLink, '_blank');
                          } else {
                            alert('No specific Google Meet link was generated for this appointment. The doctor may not have connected their Google Calendar yet. Redirecting to Google Meet home page.');
                            window.open('https://meet.google.com', '_blank');
                          }
                        }}
                      >
                        <Video size={16} /> Join
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2 d-flex align-items-center gap-1 disabled" 
                        style={{ backgroundColor: '#94a3b8' }} 
                      >
                        <Video size={16} /> Join
                      </button>
                    )}
                  </>
                ) : a.status?.toLowerCase() === 'cancelled' ? (
                  <>
                    <button className="btn btn-sm fw-bold rounded-3 px-3 py-2 disabled" style={{ border: '1px solid #94a3b8', color: '#94a3b8', backgroundColor: 'transparent' }}>
                      Cancel
                    </button>
                    <button className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2 disabled" style={{ backgroundColor: '#94a3b8' }}>
                      Reschedule
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn btn-sm fw-bold rounded-3 px-3 py-2" 
                      style={{ border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent' }} 
                      onClick={() => dispatch(cancelAppointment(a.appointment_id))}
                    >
                      Cancel
                    </button>
                    {!a.rescheduled && (
                      <button 
                        className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2" 
                        style={{ backgroundColor: '#2563EB' }} 
                        onClick={() => setRescheduleModalAppt(a)}
                      >
                        Reschedule
                      </button>
                    )}
                    <button 
                      className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2 d-flex align-items-center gap-1 disabled" 
                      style={{ backgroundColor: '#94a3b8', cursor: 'not-allowed' }} 
                      title="Waiting for doctor's confirmation"
                    >
                      <Video size={16} /> Join
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {upcoming.length === 0 && <div className="small fw-semibold" style={{ color: '#64748b' }}>No upcoming appointments.</div>}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="h6 fw-bolder mb-4" style={{ color: '#0f172a' }}>Past Appointments</h2>
        <div className="d-flex flex-column gap-3">
          {past.map((a) => (
            <div key={a.appointment_id} className="d-flex flex-wrap align-items-center justify-content-between gap-3 rounded-4 p-3 border-0" style={{ backgroundColor: '#f8fafc' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: '#e2e8f0', color: '#64748b' }}>
                  <User size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{a.doctor}</div>
                  <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{a.specialization}</div>
                  <div className="mt-1 small fw-semibold" style={{ color: '#94a3b8' }}>
                    {a.appointment_date} • {a.time} &nbsp;•&nbsp; {a.reason}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-sm fw-bold rounded-3 px-3 py-2" 
                  style={{ border: '1px solid #2563EB', color: '#2563EB', backgroundColor: 'transparent' }} 
                  onClick={() => setSelectedPastAppt(a)}
                >
                  View Details
                </button>
                {a.isRated ? (
                  <button 
                    className="btn btn-sm fw-bold rounded-3 px-3 py-2 disabled" 
                    style={{ backgroundColor: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }}
                  >
                    Reviewed
                  </button>
                ) : (
                  <Link 
                    to="/patient/rate" 
                    state={{ appointment: a }}
                    className="btn btn-sm fw-bold text-white rounded-3 px-3 py-2 shadow-sm text-decoration-none" 
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                    Review & Rating
                  </Link>
                )}
              </div>
            </div>
          ))}
          {past.length === 0 && <div className="small fw-semibold" style={{ color: '#64748b' }}>No past appointments.</div>}
        </div>
      </div>

      {selectedPastAppt && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom border-light px-4 py-3">
                <h2 className="modal-title h5 fw-bolder m-0" style={{ color: '#0f172a' }}>Consultation Summary</h2>
                <button type="button" className="btn-close" onClick={() => setSelectedPastAppt(null)}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '56px', height: '56px', backgroundColor: '#e2e8f0', color: '#64748b' }}>
                    <User size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '1.1rem' }}>{selectedPastAppt.doctor}</div>
                    <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedPastAppt.specialization}</div>
                    <div className="fw-semibold mt-1" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{selectedPastAppt.appointment_date} • {selectedPastAppt.time}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="fw-bold mb-2" style={{ color: '#334155', fontSize: '0.9rem' }}>Reason for Consultation</h3>
                  <p className="m-0 fw-semibold" style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedPastAppt.reason}</p>
                </div>

                <div className="mb-4">
                  <h3 className="fw-bold mb-2" style={{ color: '#334155', fontSize: '0.9rem' }}>Consultation Notes</h3>
                  <div className="rounded-3 p-3 fw-semibold" style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.9rem' }}>
                    {selectedPastAppt.description || 'No notes provided by the doctor.'}
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-12 col-md-6">
                    <h3 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: '#334155', fontSize: '0.9rem' }}><Pill size={16} /> Prescriptions</h3>
                    <div className="rounded-3 border p-3" style={{ borderColor: '#e2e8f0' }}>
                      <ul className="m-0 pl-3 fw-semibold" style={{ color: '#475569', fontSize: '0.9rem' }}>
                        {selectedPastAppt.prescriptions && selectedPastAppt.prescriptions.length > 0 ? (
                          selectedPastAppt.prescriptions.map((rx, idx) => <li key={idx}>{rx}</li>)
                        ) : (
                          <li className="list-unstyled text-muted small">No prescriptions</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <h3 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: '#334155', fontSize: '0.9rem' }}><FileText size={16} /> Medical Reports</h3>
                    <div className="rounded-3 border p-3 d-flex flex-column gap-2" style={{ borderColor: '#e2e8f0' }}>
                      {selectedPastAppt.attachedFiles && selectedPastAppt.attachedFiles.length > 0 ? (
                        selectedPastAppt.attachedFiles.map((file, idx) => (
                          <div key={idx} className="d-flex align-items-center justify-content-between">
                            <span className="fw-semibold text-truncate mr-2" style={{ color: '#475569', fontSize: '0.9rem' }}>{file}</span>
                            <button 
                              onClick={() => handleDownload(file)}
                              className="btn btn-link p-0 text-decoration-none fw-bold"
                              style={{ color: '#2563EB', fontSize: '0.9rem' }}
                              title="Download Report"
                            >
                              Download
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="fw-semibold text-muted small" style={{ color: '#475569' }}>No reports attached</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer border-0 px-4 pb-4">
                <button type="button" className="btn fw-bold rounded-3 px-4 py-2" style={{ border: '1px solid #cbd5e1', color: '#475569' }} onClick={() => setSelectedPastAppt(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom border-light px-4 py-3">
                <h2 className="modal-title h5 fw-bolder m-0" style={{ color: '#0f172a' }}>Request Reschedule</h2>
                <button type="button" className="btn-close" onClick={() => setRescheduleModalAppt(null)}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="rounded-3 p-3 mb-4 fw-semibold" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '0.9rem' }}>
                  You are requesting a new time for your appointment with <span className="fw-bolder">{rescheduleModalAppt.doctor}</span>.
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold mb-1" style={{ color: '#334155', fontSize: '0.9rem' }}>Preferred New Date</label>
                  <input 
                    type="date" 
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                    className="form-control rounded-3 py-2" 
                    style={{ borderColor: '#cbd5e1' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold mb-1" style={{ color: '#334155', fontSize: '0.9rem' }}>Preferred Time Slot</label>
                  <select 
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                    className="form-select rounded-3 py-2"
                    style={{ borderColor: '#cbd5e1' }}
                  >
                    <option value="">Select a time...</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold mb-1" style={{ color: '#334155', fontSize: '0.9rem' }}>Message to Doctor</label>
                  <textarea 
                    rows={3} 
                    placeholder="Explain why you are rescheduling..."
                    value={rescheduleData.message}
                    onChange={(e) => setRescheduleData({...rescheduleData, message: e.target.value})}
                    className="form-control rounded-3 py-2"
                    style={{ borderColor: '#cbd5e1' }}
                  />
                </div>
              </div>
              
              <div className="modal-footer border-top border-light px-4 pb-4">
                <button type="button" className="btn fw-bold rounded-3 px-4 py-2" style={{ border: '1px solid #cbd5e1', color: '#475569' }} onClick={() => setRescheduleModalAppt(null)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn fw-bold text-white rounded-3 px-4 py-2" 
                  style={{ backgroundColor: (!rescheduleData.date || !rescheduleData.time) ? '#cbd5e1' : '#2563EB' }}
                  disabled={!rescheduleData.date || !rescheduleData.time}
                  onClick={() => {
                    dispatch(reschedulePatientAppointment({
                      id: rescheduleModalAppt.appointment_id,
                      newDate: rescheduleData.date,
                      newTime: rescheduleData.time
                    }));
                    alert(`Reschedule request sent to ${rescheduleModalAppt.doctor}.`);
                    setRescheduleModalAppt(null);
                    setRescheduleData({ date: '', time: '', message: '' });
                  }}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
