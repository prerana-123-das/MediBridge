import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, User, FileText, X, Clock, Calendar, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Avatar from '../../components/common/Avatar'
import { doctorNav } from './doctorNav'
import { fetchDoctorDashboard } from '../../features/appointments/appointmentsSlice'

// The Patient Records page where doctors can view a searchable list of all patients
// they have treated or are scheduled to treat. 
export default function PatientRecordsDoctor() {
  const dispatch = useDispatch()
  
  // Grab the master list of patient records from Redux (fallback to empty array if none exist)
  const patientRecords = useSelector((s) => s.appointments.doctor.patientRecords || [])
  
  // State for the search bar query
  const [q, setQ] = useState('')
  
  // State variables for controlling which pop-up modal is open
  const [viewingProfile, setViewingProfile] = useState(null) // Controls the 'Patient Profile' modal
  const [viewingConsult, setViewingConsult] = useState(null) // Controls the 'Consult Details' modal
  
  // Fetch the latest dashboard data as soon as the page loads
  useEffect(() => { dispatch(fetchDoctorDashboard()) }, [dispatch])
  
  // A helper function to simulate downloading a file attached to a consultation.
  // In a real app, this would fetch a real file from a server (like AWS S3).
  // Here, it just creates a temporary text file in the browser and triggers a download.
  const handleDownloadFile = (filename) => {
    const element = document.createElement("a")
    const fileBlob = new Blob([`Mock contents for ${filename}\nGenerated securely from MediBridge.`], {type: 'text/plain'})
    element.href = URL.createObjectURL(fileBlob)
    element.download = filename
    document.body.appendChild(element)
    element.click() // Programmatically click the hidden link to start the download
    document.body.removeChild(element)
  }
  
  // Filter the list of patients based on whatever the doctor has typed into the search bar
  const rows = patientRecords.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <DashboardLayout badge="Doctor" navItems={doctorNav}>
      
      {/* Header & Search Bar Section */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 mb-4">
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Patient Records</h1>
        <div className="position-relative" style={{ width: '280px' }}>
          <Search className="position-absolute top-50 translate-middle-y" style={{ left: '12px', color: '#94a3b8' }} size={18} />
          {/* The input updates the 'q' state on every keystroke, which instantly filters the table rows */}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients..."
            className="form-control rounded-3 border ps-5 pe-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
        </div>
      </div>

      {/* Main Patient Data Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4" style={{ backgroundColor: '#fff' }}>
        <div className="table-responsive">
          <table className="table mb-0 align-middle small text-start">
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#64748b', backgroundColor: 'transparent' }}>Patient Name</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#64748b', backgroundColor: 'transparent' }}>Age</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#64748b', backgroundColor: 'transparent' }}>Last Visit</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#64748b', backgroundColor: 'transparent' }}>Condition</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#64748b', backgroundColor: 'transparent' }}>Next Appointment</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#64748b', backgroundColor: 'transparent' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className={`px-4 py-3 ${i === rows.length - 1 ? 'border-0' : 'border-bottom'}`} style={{ borderBottomColor: '#f1f5f9' }}>
                    <div className="d-flex align-items-center gap-3">
                      <Avatar size={34} />
                      <span className="fw-bold" style={{ color: '#1e293b' }}>{r.name}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${i === rows.length - 1 ? 'border-0' : 'border-bottom'}`} style={{ color: '#475569', borderBottomColor: '#f1f5f9' }}>{r.age}</td>
                  <td className={`px-4 py-3 ${i === rows.length - 1 ? 'border-0' : 'border-bottom'}`} style={{ color: '#475569', borderBottomColor: '#f1f5f9' }}>{r.last_visit}</td>
                  <td className={`px-4 py-3 ${i === rows.length - 1 ? 'border-0' : 'border-bottom'}`} style={{ borderBottomColor: '#f1f5f9' }}>
                    <span className="badge rounded-3 fw-bold" style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 10px' }}>
                      {r.condition}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${i === rows.length - 1 ? 'border-0' : 'border-bottom'}`} style={{ color: '#475569', borderBottomColor: '#f1f5f9' }}>{r.next}</td>
                  <td className={`px-4 py-3 ${i === rows.length - 1 ? 'border-0' : 'border-bottom'}`} style={{ borderBottomColor: '#f1f5f9' }}>
                    <div className="d-flex align-items-center gap-2">
                      <button onClick={() => setViewingProfile(r)} className="btn btn-sm border-0 rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }} title="View Profile">
                        <User size={16} />
                      </button>
                      <button onClick={() => setViewingConsult(r)} className="btn btn-sm border-0 rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#faf5ff', color: '#9333ea' }} title="Consult Details">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-secondary border-0">No patient records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {viewingProfile && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-100 bg-white rounded-4 shadow-lg overflow-hidden" style={{ maxWidth: '500px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom px-4 py-3" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
              <h3 className="h6 fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <User style={{ color: '#2563EB' }} size={18} /> Patient Profile
              </h3>
              <button onClick={() => setViewingProfile(null)} className="btn btn-sm border-0 p-0 text-secondary">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="d-flex align-items-center gap-3 border-bottom pb-4 mb-4" style={{ borderColor: '#f1f5f9' }}>
                <Avatar size={64} />
                <div>
                  <h2 className="h4 fw-bolder m-0" style={{ color: '#0f172a' }}>{viewingProfile.name}</h2>
                  <div className="small fw-bold mt-1" style={{ color: '#64748b' }}>{viewingProfile.age} Years Old</div>
                </div>
              </div>
              
              <div className="row gy-4 gx-3 small">
                <div className="col-6">
                  <div className="fw-bold mb-1" style={{ color: '#64748b' }}>Current Condition</div>
                  <div className="fw-bold"><span className="badge rounded-3" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>{viewingProfile.condition}</span></div>
                </div>
                <div className="col-6">
                  <div className="fw-bold mb-1" style={{ color: '#64748b' }}>Blood Group</div>
                  <div className="fw-bold text-danger">{viewingProfile.blood_group || 'O+'}</div>
                </div>
                <div className="col-6">
                  <div className="fw-bold mb-1 d-flex align-items-center gap-1" style={{ color: '#64748b' }}><Calendar size={14} /> Last Visit</div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{viewingProfile.last_visit}</div>
                </div>
                <div className="col-6">
                  <div className="fw-bold mb-1 d-flex align-items-center gap-1" style={{ color: '#64748b' }}><Clock size={14} /> Next Appt</div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{viewingProfile.next}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consult Details Modal */}
      {viewingConsult && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-100 bg-white rounded-4 shadow-lg overflow-hidden" style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom px-4 py-3" style={{ backgroundColor: '#faf5ff', borderColor: '#f1f5f9' }}>
              <h3 className="h6 fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#581c87' }}>
                <FileText style={{ color: '#9333ea' }} size={18} /> Consult Details
              </h3>
              <button onClick={() => setViewingConsult(null)} className="btn btn-sm border-0 p-0 text-secondary">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4" style={{ borderColor: '#f1f5f9' }}>
                <div>
                  <div className="small fw-bold text-uppercase" style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Patient</div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{viewingConsult.name}</div>
                </div>
                <div className="text-end">
                  <div className="small fw-bold text-uppercase" style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Appointment Time</div>
                  <div className="fw-bold d-flex align-items-center gap-2 justify-content-end" style={{ color: '#0f172a' }}>
                     <Calendar size={14} style={{ color: '#2563EB' }} /> {viewingConsult.next} 
                     <span style={{ color: '#cbd5e1' }}>|</span> 
                     <Clock size={14} style={{ color: '#2563EB' }} /> {viewingConsult.time}
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-4">
                <div>
                  <h4 className="small fw-bold mb-2" style={{ color: '#0f172a' }}>Reason for Consult</h4>
                  <div className="rounded-3 border p-3 small fw-bold" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9', color: '#334155' }}>
                    {viewingConsult.reason}
                  </div>
                </div>
                
                <div>
                  <h4 className="small fw-bold mb-2" style={{ color: '#0f172a' }}>Description / Notes</h4>
                  <div className="rounded-3 border p-3 small" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9', color: '#475569', minHeight: '80px' }}>
                    {viewingConsult.description || 'No additional description provided by patient.'}
                  </div>
                </div>

                <div>
                  <h4 className="small fw-bold mb-2" style={{ color: '#0f172a' }}>Attached Files ({viewingConsult.files?.length || 0})</h4>
                  {viewingConsult.files && viewingConsult.files.length > 0 ? (
                    <div className="row g-2">
                      {viewingConsult.files.map((file, i) => (
                        <div key={i} className="col-12 col-sm-6">
                          <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white" style={{ borderColor: '#e2e8f0' }}>
                            <div className="d-flex align-items-center gap-2 overflow-hidden">
                              <FileText size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
                              <span className="small fw-bold text-truncate" style={{ color: '#334155' }}>{file}</span>
                            </div>
                            <button onClick={() => handleDownloadFile(file)} className="btn btn-sm border-0 p-0 text-secondary"><Download size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="small fst-italic" style={{ color: '#64748b' }}>No files attached for this consultation.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
