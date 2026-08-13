import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Star, Calendar, Clock, FileUp, User } from 'lucide-react'
import DashboardTopbar from '../../components/layout/DashboardTopbar'
import { fetchDoctors, fetchAvailableSlots, fetchSpecialties } from '../../features/doctors/doctorsSlice'

// These are the steps the patient follows while booking an appointment.
const steps = ['Select Specialty', 'Choose Doctor', 'Select Time', 'Details', 'Confirm']

function Stepper({ current }) {
  return (
    <div className="w-100 py-4">
      <div className="d-flex align-items-center w-100">
        {steps.map((label, i) => (
          <div 
            key={label} 
            className="d-flex align-items-center" 
            style={{ flexGrow: i < steps.length - 1 ? 1 : 0 }}
          >
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle fw-bold shadow-sm"
                style={{
                  width: '36px', height: '36px',
                  backgroundColor: i <= current ? '#2563EB' : '#e2e8f0',
                  color: i <= current ? '#fff' : '#64748b',
                  fontSize: '0.9rem'
                }}
              >
                {i < current ? <Check size={18} strokeWidth={2.5} /> : i + 1}
              </div>
              <span className="d-none d-md-block fw-semibold" style={{ color: i <= current ? '#0f172a' : '#64748b', fontSize: '0.95rem' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div 
                className="flex-grow-1 mx-2 mx-sm-3" 
                style={{ height: '2px', backgroundColor: '#e2e8f0', minWidth: '10px' }} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BookAppointment() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Get doctor-related data directly from Redux instead of keeping a separate copy here.
  const doctors = useSelector((s) => s.doctors.list)
  const specialties = useSelector((s) => s.doctors.specialties) || []

  // Keep track of the patient's current selection throughout the booking flow.
  const [step, setStep] = useState(0)
  const [specialty, setSpecialty] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState(null)
  
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])
  const availableSlots = useSelector(s => s.doctors.availableSlots) || []

  // Once both doctor and date are selected, fetch the slots available for that day.
  useEffect(() => {
    if (doctor?.doctorId && date) {
      dispatch(fetchAvailableSlots({ doctorId: doctor.doctorId, date }))
      setSlot(null)
    }
  }, [dispatch, doctor, date])

  // Load the initial doctor and specialty data when the booking page opens.
  useEffect(() => { 
    dispatch(fetchDoctors())
    dispatch(fetchSpecialties())
  }, [dispatch])

  // Handle cases where the user arrives here after selecting a doctor from another page.
  useEffect(() => {
    if (location.state?.skipToDate && location.state?.doctorId && doctors.length > 0) {
      const selectedDoc = doctors.find(d => String(d.doctorId) === String(location.state.doctorId))
      if (selectedDoc) {
        setDoctor(selectedDoc)
        setSpecialty(selectedDoc.specialization)
        setStep(2)
        navigate('.', { replace: true, state: {} })
      }
    }
  }, [location.state, doctors, navigate])

  // Pass all the booking details to the payment page before moving forward.
  const proceedToPayment = () => {
    navigate('/patient/payment', { state: { doctor, date, slot, specialty, subject, description, attachedFiles: files.map(f => f.name) } })
  }

  // Store the selected files so they can be included with the appointment details.
  const handleFileUpload = (e) => {
    if (e.target.files?.length) {
      setFiles([...files, ...Array.from(e.target.files)])
    }
  }

  return (
    <div className="min-vh-100 font-sans-custom" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardTopbar />
      <div className="container py-4" style={{ maxWidth: '960px' }}>
        <Stepper current={step} />

        {step === 0 && (
          <div className="mt-4">
            <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Select Specialization</h1>
            <p className="mt-1 mb-4" style={{ color: '#64748b' }}>Choose the medical specialty you need</p>
            <div className="row g-4">
              {specialties.map((s) => (
                <div className="col-12 col-sm-6 col-lg-4" key={s.name}>
                  <button 
                    onClick={() => { setSpecialty(s.name); setStep(1) }}
                    className="card h-100 w-100 border-0 shadow-sm rounded-4 p-4 text-start bg-white"
                    style={{ border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ fontSize: '2rem' }}>{s.emoji}</div>
                    <div className="mt-4 fw-bold" style={{ color: '#0f172a', fontSize: '1.1rem' }}>{s.name}</div>
                    <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{s.doctors} doctors available</div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4">
            <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Choose a Doctor</h1>
            <p className="mt-1 mb-4" style={{ color: '#64748b' }}>{specialty} specialists available</p>
            <div className="d-flex flex-column gap-3">
              {doctors.filter(d => {
                if (!specialty) return true;
                return d.specialization === specialty;
              }).map((d) => (
                <div key={d.doctorId} className="card rounded-4 p-4 border-0 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
                    <div className="d-flex align-items-center gap-4">
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '56px', height: '56px', backgroundColor: '#2563EB', color: '#fff' }}>
                        <User size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '1.1rem' }}>{d.fullName}</div>
                        <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{d.specialization}</div>
                        <div className="mt-2 d-flex align-items-center gap-2 small fw-semibold" style={{ color: '#94a3b8' }}>
                          <span className="d-flex align-items-center gap-1 fw-bold" style={{ color: '#f59e0b' }}>
                            <Star size={14} fill="currentColor" color="#f59e0b" /> {d.rating}
                          </span>
                          <span>&bull; {d.experienceYears || '10+'} yrs &bull; ${d.consultationFee || '150'}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setDoctor(d); setStep(2) }} 
                      className="btn fw-bold text-white rounded-3 px-4 py-2"
                      style={{ backgroundColor: '#2563EB', fontSize: '0.9rem' }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="btn btn-link text-decoration-none fw-semibold p-0 mt-4" style={{ color: '#64748b' }}>&larr; Back</button>
          </div>
        )}

        
        {step === 2 && (
          <div className="mt-4">
            <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Select Date & Time</h1>
            <p className="mt-1 mb-4" style={{ color: '#64748b' }}>Pick a slot with {doctor?.fullName}</p>
            
            <div className="card rounded-4 p-4 shadow-sm border-0 bg-white mb-4" style={{ border: '1px solid #e2e8f0' }}>
              <label className="fw-bold mb-2" style={{ color: '#334155', fontSize: '0.9rem' }}>Appointment Date</label>
              <div className="position-relative" style={{ maxWidth: '300px' }}>
                <Calendar className="position-absolute top-50 translate-middle-y" style={{ left: '12px', color: '#94a3b8' }} size={18} />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control rounded-3 py-2 border" 
                  style={{ paddingLeft: '38px', borderColor: '#cbd5e1' }}
                />
              </div>
              
              <div className="row g-3 mt-4">
                {availableSlots.length > 0 ? availableSlots.map((t) => (
                  <div className="col-4 col-sm-3" key={t}>
                    <button 
                      onClick={() => setSlot(t)}
                      className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold rounded-3"
                      style={{
                        fontSize: '0.9rem',
                        backgroundColor: slot === t ? '#eff6ff' : 'transparent',
                        color: slot === t ? '#2563EB' : '#475569',
                        border: slot === t ? '1px solid #2563EB' : '1px solid #cbd5e1'
                      }}
                    >
                      <Clock size={14} /> {t}
                    </button>
                  </div>
                )) : (
                  <div className="col-12 text-center py-3">
                    <span className="small fw-semibold" style={{ color: '#64748b' }}>No time slots available for this date.</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button onClick={() => setStep(1)} className="btn btn-link text-decoration-none fw-semibold p-0" style={{ color: '#64748b' }}>← Back</button>
              <button 
                onClick={() => setStep(3)} 
                className="btn fw-bold text-white rounded-3 px-5 py-2"
                style={{ backgroundColor: (!date || !slot) ? '#cbd5e1' : '#2563EB' }}
                disabled={!date || !slot}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Appointment Details</h1>
            <p className="mt-1 mb-4" style={{ color: '#64748b' }}>Provide more context for your consultation</p>
            
            <div className="card rounded-4 p-4 shadow-sm border-0 bg-white mb-4" style={{ border: '1px solid #e2e8f0', maxWidth: '600px' }}>
              <div className="mb-4">
                <label className="fw-bold mb-2" style={{ color: '#334155', fontSize: '0.9rem' }}>Reason for Consultation *</label>
                <input 
                  type="text" 
                  className="form-control rounded-3 py-2 border" 
                  style={{ borderColor: '#cbd5e1' }}
                  placeholder="E.g., Follow up for blood pressure, Mild fever..." 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <label className="fw-bold mb-2" style={{ color: '#334155', fontSize: '0.9rem' }}>Description</label>
                <textarea 
                  rows={3} 
                  className="form-control rounded-3 py-2 border" 
                  style={{ borderColor: '#cbd5e1' }}
                  placeholder="Provide any additional details or symptoms..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="fw-bold mb-2" style={{ color: '#334155', fontSize: '0.9rem' }}>Medical Documents (Optional)</label>
                <div className="d-flex flex-column align-items-center justify-content-center rounded-3 p-4 text-center" style={{ border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
                  <FileUp className="mb-2" style={{ color: '#94a3b8' }} size={24} />
                  <div className="small fw-semibold" style={{ color: '#475569' }}>Drag and drop files here, or</div>
                  <label className="btn btn-sm bg-white fw-bold shadow-sm rounded-3 px-3 py-1 mt-3" style={{ border: '1px solid #e2e8f0', color: '#2563EB', cursor: 'pointer' }}>
                    Browse Files
                    <input type="file" multiple className="d-none" onChange={handleFileUpload} />
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 small fw-semibold" style={{ color: '#475569' }}>
                    <span className="fw-bold">Attached:</span> {files.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-4" style={{ maxWidth: '600px' }}>
              <button onClick={() => setStep(2)} className="btn btn-link text-decoration-none fw-semibold p-0" style={{ color: '#64748b' }}>← Back</button>
              <button 
                onClick={() => setStep(4)} 
                className="btn fw-bold text-white rounded-3 px-5 py-2"
                style={{ backgroundColor: !subject ? '#cbd5e1' : '#2563EB' }}
                disabled={!subject}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4">
            <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Confirm Appointment</h1>
            <p className="mt-1 mb-4" style={{ color: '#64748b' }}>Review your booking details</p>
            
            <div className="card rounded-4 p-4 p-md-5 border-0 bg-white mb-4" style={{ border: '2px solid #f1f5f9', maxWidth: '600px' }}>
              <div className="d-flex align-items-center gap-4 border-bottom pb-4" style={{ borderColor: '#f8fafc' }}>
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '64px', height: '64px', backgroundColor: '#2563EB', color: '#fff' }}>
                  <User size={28} strokeWidth={2} />
                </div>
                <div>
                  <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '1.2rem' }}>{doctor?.fullName}</div>
                  <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.95rem' }}>{doctor?.specialization}</div>
                </div>
              </div>
              
              <div className="mt-4 d-flex flex-column gap-4" style={{ fontSize: '0.95rem' }}>
                <div className="d-flex justify-content-between"><span className="fw-semibold" style={{ color: '#64748b' }}>Specialty</span><span className="fw-bolder" style={{ color: '#1e293b' }}>{specialty}</span></div>
                <div className="d-flex justify-content-between"><span className="fw-semibold" style={{ color: '#64748b' }}>Date</span><span className="fw-bolder" style={{ color: '#1e293b' }}>{date}</span></div>
                <div className="d-flex justify-content-between"><span className="fw-semibold" style={{ color: '#64748b' }}>Time</span><span className="fw-bolder" style={{ color: '#1e293b' }}>{slot}</span></div>
                <div className="d-flex justify-content-between"><span className="fw-semibold" style={{ color: '#64748b' }}>Reason</span><span className="fw-bolder text-truncate" style={{ color: '#1e293b', maxWidth: '250px' }}>{subject}</span></div>
                {description && <div className="d-flex justify-content-between"><span className="fw-semibold" style={{ color: '#64748b' }}>Description</span><span className="fw-bolder text-truncate" style={{ color: '#1e293b', maxWidth: '250px' }}>{description}</span></div>}
                
                <div className="d-flex justify-content-between border-top pt-4 mt-2" style={{ borderColor: '#f8fafc' }}>
                  <span className="fw-semibold" style={{ color: '#64748b' }}>Consultation Fee</span>
                  <span className="fw-bolder" style={{ color: '#0f172a', fontSize: '1.1rem' }}>${doctor?.consultationFee || '150'}</span>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-4" style={{ maxWidth: '600px' }}>
              <button onClick={() => setStep(3)} className="btn btn-link text-decoration-none fw-semibold p-0" style={{ color: '#64748b' }}>&larr; Back</button>
              <button 
                onClick={proceedToPayment} 
                className="btn fw-bold text-white rounded-3 px-4 py-2"
                style={{ backgroundColor: '#2563EB', fontSize: '1rem' }}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
