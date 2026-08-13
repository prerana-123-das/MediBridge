import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, FileText, Trash2, X, User, Briefcase, Pill, Download as DownloadIcon } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminNav } from './adminNav'
import { fetchAdminAppointments, fetchDeleteAppointment } from '../../features/admin/adminSlice'

// The Admin Appointments page provides a god's-eye view of every single 
// appointment on the platform, allowing the admin to search, filter, and export them.
export default function AdminAppointments() {
  const dispatch = useDispatch()
  
  // Pull the master list of all appointments from the Redux store
  const appts = useSelector((s) => s.admin.appointments)
  
  // Multiple state variables for the advanced filtering bar
  const [status, setStatus] = useState('All Status')
  const [patient, setPatient] = useState('')
  const [doctor, setDoctor] = useState('')
  
  // Controls the display of the full Consultation Record modal
  const [prescriptionModalAppt, setPrescriptionModalAppt] = useState(null)
  
  // Fetch the latest appointments from the backend when the page loads
  useEffect(() => { dispatch(fetchAdminAppointments()) }, [dispatch])
  
  // Filter the list of appointments based on three different filters simultaneously.
  // An appointment must match the selected status AND the patient name search AND the doctor name search to be displayed.
  const rows = appts.filter((a) =>
    (status === 'All Status' || (a.status || '').toLowerCase() === status.toLowerCase()) &&
    (a.patientName || '').toLowerCase().includes(patient.toLowerCase()) &&
    (a.doctorName || '').toLowerCase().includes(doctor.toLowerCase())
  )

  // Generates a CSV file of the currently filtered table data and downloads it
  const handleExportCSV = () => {
    const headers = ['Appointment ID', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status']
    const csvContent = [
      headers.join(','),
      ...rows.map(r => {
        const [d, t] = (r.appointmentDate || '').split('T');
        return `"${r.appointmentId}","${r.patientName}","${r.doctorName}","${d}","${t || ''}","${r.type || 'Consultation'}","${r.status}"`;
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `appointments_export_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  // Immediately deletes the appointment from the database (with a confirmation prompt first)
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      dispatch(fetchDeleteAppointment(id))
    }
  }

  // Simulates downloading an attached file from the consultation record
  const handleDownloadFile = (filename) => {
    const element = document.createElement("a")
    const fileBlob = new Blob([`Mock contents for ${filename}\nGenerated securely from MediBridge System.`], {type: 'text/plain'})
    element.href = URL.createObjectURL(fileBlob)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <DashboardLayout badge="Admin" navItems={adminNav}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>All Appointments</h1>
        <button 
          onClick={handleExportCSV}
          className="btn fw-bold text-white d-flex align-items-center gap-2 rounded-3 px-4 py-2"
          style={{ backgroundColor: '#16a34a', border: 'none' }}
        >
          <Download size={18} strokeWidth={2.5} /> Export CSV
        </button>
      </div>

      {/* SECTION 1: The Multi-Filter Bar */}
      <div className="card rounded-4 p-3 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <select 
              className="form-select rounded-3 py-2 border" 
              style={{ borderColor: '#cbd5e1', cursor: 'pointer' }}
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Suggested</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <input 
              type="date" 
              className="form-control rounded-3 py-2 border" 
              style={{ borderColor: '#cbd5e1' }} 
            />
          </div>
          <div className="col-12 col-md-3">
            <input 
              type="text"
              placeholder="Search patient..." 
              className="form-control rounded-3 py-2 border" 
              style={{ borderColor: '#cbd5e1' }}
              value={patient} 
              onChange={(e) => setPatient(e.target.value)} 
            />
          </div>
          <div className="col-12 col-md-3">
            <input 
              type="text"
              placeholder="Search doctor..." 
              className="form-control rounded-3 py-2 border" 
              style={{ borderColor: '#cbd5e1' }}
              value={doctor} 
              onChange={(e) => setDoctor(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: The Data Table */}
      <div className="card rounded-4 shadow-sm border-0 overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0" style={{ minWidth: '900px' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                {['Appointment ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="border-0 fw-semibold py-4 px-4" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.appointmentId}>
                  <td className="px-4 py-4 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>
                    #{a.appointmentId}
                  </td>
                  <td className="px-4 py-4 border-bottom fw-bold" style={{ borderColor: '#f1f5f9', color: '#0f172a' }}>
                    {a.patientName || 'Unknown'}
                  </td>
                  <td className="px-4 py-4 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>
                    {a.doctorName || 'Unknown'}
                  </td>
                  <td className="px-4 py-4 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>
                    {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-4 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>
                    {a.appointmentDate ? new Date(a.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                  </td>
                  <td className="px-4 py-4 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                    {(a.status || '').toLowerCase() === 'confirmed' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#e6f4ea', color: '#0d9488', padding: '6px 12px' }}>Confirmed</span>}
                    {(a.status || '').toLowerCase() === 'pending' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fef08a', color: '#b45309', padding: '6px 12px' }}>Pending</span>}
                    {(a.status || '').toLowerCase() === 'suggested' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px' }}>Reschedule Suggested</span>}
                    {(a.status || '').toLowerCase() === 'cancelled' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '6px 12px' }}>Cancelled</span>}
                    {(a.status || '').toLowerCase() === 'completed' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px' }}>Completed</span>}
                  </td>
                  <td className="px-4 py-4 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        onClick={() => setPrescriptionModalAppt(a)}
                        className="btn btn-sm d-flex align-items-center justify-content-center rounded-3" 
                        style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', color: '#2563EB', border: 'none' }}
                        title="View Prescription Details"
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.appointmentId)}
                        className="btn btn-sm d-flex align-items-center justify-content-center rounded-3" 
                        style={{ width: '32px', height: '32px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }}
                        title="Delete Appointment" 
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-5 text-center fw-semibold" style={{ color: '#64748b' }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 
        SECTION 3: The Consultation Details Modal 
        This pops up when the admin clicks the blue 'FileText' icon.
        It shows the full interaction between the patient and the doctor, including attached files and prescriptions.
      */}
      {prescriptionModalAppt && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <h3 className="modal-title h6 fw-bolder m-0 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <FileText style={{ color: '#2563EB' }} size={18} /> Consultation & Prescription Record
                </h3>
                <button type="button" className="btn-close" onClick={() => setPrescriptionModalAppt(null)} style={{ fontSize: '0.8rem' }}></button>
              </div>
              
              <div className="modal-body p-4 p-md-5 bg-white">
                <div className="row g-4 border-bottom pb-4 mb-4" style={{ borderColor: '#f1f5f9' }}>
                  {/* Patient Info */}
                  <div className="col-12 col-md-6 d-flex align-items-start gap-4">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '64px', height: '64px', backgroundColor: '#eff6ff', color: '#2563EB', borderRadius: '50%' }}>
                      <User size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="fw-bold text-uppercase mb-1 d-flex align-items-center gap-1" style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        <User size={12}/> Patient
                      </div>
                      <h4 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.25rem' }}>{prescriptionModalAppt.patientName || 'Unknown'}</h4>
                      <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Patient Details
                      </div>
                    </div>
                  </div>
                  
                  {/* Doctor Info */}
                  <div className="col-12 col-md-6 d-flex align-items-start gap-4">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '64px', height: '64px', backgroundColor: '#eff6ff', color: '#2563EB', borderRadius: '50%' }}>
                      <Briefcase size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="fw-bold text-uppercase mb-1 d-flex align-items-center gap-1" style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        <Briefcase size={12}/> Attending Doctor
                      </div>
                      <h4 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.25rem' }}>{prescriptionModalAppt.doctorName || 'Unknown'}</h4>
                      <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {prescriptionModalAppt.doctorSpecialization || 'Specialist'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-5">
                  {/* Patient Description / Reason */}
                  <div>
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a', fontSize: '1rem' }}>Patient's Description & Reason for Visit</h4>
                    <div className="rounded-4 p-4 fw-medium" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', color: '#334155', fontSize: '0.95rem' }}>
                      {prescriptionModalAppt.reason || 'No reason provided.'}
                    </div>
                  </div>

                  {/* Patient Attached Files */}
                  <div>
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a', fontSize: '1rem' }}>Patient Attached Files</h4>
                    <div className="d-flex flex-wrap gap-3">
                      {(prescriptionModalAppt.attachedFiles && prescriptionModalAppt.attachedFiles.length > 0) ? (
                        prescriptionModalAppt.attachedFiles.map((file) => (
                          <div key={file} className="d-flex align-items-center gap-3 rounded-4 p-2 pe-3 shadow-sm" style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                            <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#2563EB' }}>
                              <FileText size={18} strokeWidth={2} />
                            </div>
                            <span className="fw-semibold text-truncate" style={{ color: '#334155', fontSize: '0.9rem', maxWidth: '200px' }}>{file}</span>
                            <button 
                              onClick={() => handleDownloadFile(file)} 
                              className="btn btn-sm ms-2 flex-shrink-0 d-flex align-items-center justify-content-center rounded-3 p-0" 
                              style={{ color: '#94a3b8', border: 'none', backgroundColor: 'transparent' }}
                              title="Download File"
                            >
                              <DownloadIcon size={18} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="small" style={{ color: '#64748b' }}>No files attached.</div>
                      )}
                    </div>
                  </div>

                  {/* Doctor's Prescription */}
                  {((prescriptionModalAppt.status || '').toLowerCase() === 'confirmed' || (prescriptionModalAppt.status || '').toLowerCase() === 'completed') && (
                    <div>
                      <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a', fontSize: '1rem' }}>
                        <Pill size={18} style={{ color: '#2563EB' }} /> Doctor's Prescription
                      </h4>
                      <div className="rounded-4 overflow-hidden" style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                        <ul className="list-unstyled m-0">
                          {(prescriptionModalAppt.prescriptions && prescriptionModalAppt.prescriptions.length > 0) ? (
                            prescriptionModalAppt.prescriptions.map((rx, idx) => (
                              <li key={idx} className="p-3 d-flex align-items-center justify-content-between border-bottom" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                                <span className="fw-bold" style={{ color: '#1e293b' }}>{rx}</span>
                              </li>
                            ))
                          ) : (
                            <li className="p-3 small" style={{ color: '#64748b', backgroundColor: '#f8fafc' }}>No prescriptions provided yet.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer border-top px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <button 
                  onClick={() => setPrescriptionModalAppt(null)}
                  className="btn fw-bold rounded-3 px-4 py-2 shadow-sm"
                  style={{ border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#fff' }}
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
