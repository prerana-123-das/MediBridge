import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Eye, Power, Ban, X, User, Briefcase, FileText, Download, Phone, Mail } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminNav } from './adminNav'
import { fetchAdminDoctors, fetchToggleDoctorStatus } from '../../features/admin/adminSlice'

// Mock documents for doctors
const doctorDocuments = [
  { id: 'doc-1', name: 'Medical License.pdf', type: 'Certification', date: '2026-01-15' },
  { id: 'doc-2', name: 'Board Certification.pdf', type: 'Certification', date: '2026-01-20' },
  { id: 'doc-3', name: 'ID Proof.jpg', type: 'Identity', date: '2026-01-15' },
]

// The Manage Doctors page where admins can view all registered doctors,
// review their verification documents, and suspend or activate their accounts.
export default function ManageDoctors() {
  const dispatch = useDispatch()
  
  // Grab the master list of all doctors from the Redux store
  const doctors = useSelector((s) => s.admin.doctors)
  
  // State for the search bar query
  const [q, setQ] = useState('')
  
  // When this is set to a doctor object, it opens the "Full Profile" modal for that doctor
  const [viewingDoctor, setViewingDoctor] = useState(null)

  // Fetch the latest doctor list from the backend as soon as the page loads
  useEffect(() => { dispatch(fetchAdminDoctors()) }, [dispatch])

  // Filter the list of doctors based on the search bar. 
  // We check their name, specialization, AND license number so the admin can search by any of those!
  const rows = doctors.filter((d) => `${d.fullName} ${d.specialization} ${d.licenseNumber}`.toLowerCase().includes(q.toLowerCase()))

  // Toggles a doctor between 'active' and 'inactive'
  const toggleStatus = (id, currentStatus) => {
    const newStatus = (currentStatus || '').toLowerCase() === 'active' ? 'inactive' : 'active'
    dispatch(fetchToggleDoctorStatus({ id, status: newStatus }))
  }

  // Toggles a doctor into a 'suspended' state (e.g. for policy violations)
  const toggleSuspend = (id, currentStatus) => {
    const newStatus = (currentStatus || '').toLowerCase() === 'suspended' ? 'active' : 'suspended'
    dispatch(fetchToggleDoctorStatus({ id, status: newStatus }))
  }

  // Helper function to simulate downloading a verification document
  const handleDownload = (docName) => {
    const element = document.createElement("a")
    const fileBlob = new Blob([`Mock document contents for ${docName}\nGenerated securely from MediBridge System.`], {type: 'text/plain'})
    element.href = URL.createObjectURL(fileBlob)
    element.download = `${docName.replace(/ /g, '_')}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <DashboardLayout badge="Admin" navItems={adminNav}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.75rem' }}>Manage Doctors</h1>
      </div>

      {/* SECTION 1: Search Bar */}
      <div className="card rounded-4 p-3 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="position-relative">
          <Search className="position-absolute top-50 translate-middle-y" style={{ left: '16px', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            className="form-control rounded-3 py-2 border pe-3" 
            style={{ paddingLeft: '44px', borderColor: '#cbd5e1', fontSize: '0.9rem' }}
            placeholder="Search doctors by name, specialty, or license..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
      </div>

      {/* SECTION 2: The Data Table */}
      <div className="card rounded-4 shadow-sm border-0 overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0" style={{ minWidth: '800px' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                {['Name', 'Email', 'Specialty', 'License', 'Patients', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="border-0 fw-semibold py-4 px-4" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const currentStatus = (d.status || '').toLowerCase()
                return (
                  <tr key={d.doctorId}>
                    <td className="px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', color: '#2563EB' }}>
                          <User size={16} strokeWidth={2} />
                        </div>
                        <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.875rem' }}>{d.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-bottom fw-semibold" style={{ borderColor: '#f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>{d.email}</td>
                    <td className="px-4 py-3 border-bottom fw-semibold" style={{ borderColor: '#f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>{d.specialization}</td>
                    <td className="px-4 py-3 border-bottom fw-semibold" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{d.licenseNumber}</span>
                    </td>
                    <td className="px-4 py-3 border-bottom fw-semibold" style={{ borderColor: '#f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>{d.patients}</td>
                    <td className="px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      {currentStatus === 'active' ? (
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '5px 10px', fontSize: '0.75rem' }}>Active</span>
                      ) : currentStatus === 'inactive' ? (
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '5px 10px', fontSize: '0.75rem' }}>Inactive</span>
                      ) : (
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '5px 10px', fontSize: '0.75rem' }}>Suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      <div className="d-flex align-items-center gap-2">
                        <button 
                          onClick={() => setViewingDoctor(d)} 
                          className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle" 
                          style={{ width: '28px', height: '28px', backgroundColor: '#eff6ff', color: '#2563EB', border: 'none' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle" 
                          style={{ 
                            width: '28px', height: '28px', border: 'none',
                            backgroundColor: currentStatus === 'active' ? '#fef3c7' : '#dcfce7',
                            color: currentStatus === 'active' ? '#f59e0b' : '#16a34a'
                          }}
                          title={currentStatus === 'active' ? 'Deactivate Account' : 'Activate Account'}
                          onClick={() => toggleStatus(d.doctorId, currentStatus)}
                        >
                          <Power size={14} />
                        </button>
                        <button 
                          className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle" 
                          style={{ 
                            width: '28px', height: '28px', border: 'none',
                            backgroundColor: currentStatus === 'suspended' ? '#f1f5f9' : '#fee2e2',
                            color: currentStatus === 'suspended' ? '#64748b' : '#ef4444'
                          }}
                          title={currentStatus === 'suspended' ? 'Unsuspend Account' : 'Suspend Account'}
                          onClick={() => toggleSuspend(d.doctorId, currentStatus)}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-5 text-center fw-semibold" style={{ color: '#64748b' }}>No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 
        SECTION 3: Doctor Full Profile Modal 
        This only renders if the 'viewingDoctor' state contains a doctor object.
        It uses Bootstrap's modal classes but forces display block ('d-block') to show it without jQuery.
      */}
      {viewingDoctor && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <h3 className="modal-title h6 fw-bolder m-0 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <User style={{ color: '#2563EB' }} size={18} /> Doctor Full Profile
                </h3>
                <button type="button" className="btn-close" onClick={() => setViewingDoctor(null)} style={{ fontSize: '0.8rem' }}></button>
              </div>
              
              <div className="modal-body p-4 p-md-5 bg-white">
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-4 border-bottom pb-4 mb-4" style={{ borderColor: '#f1f5f9' }}>
                  <div className="d-flex align-items-center gap-4">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', color: '#2563EB', borderRadius: '50%' }}>
                      <User size={32} strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.75rem', wordBreak: 'break-word' }}>{viewingDoctor.fullName}</h2>
                      <div className="d-flex align-items-center gap-3 mt-2 fw-semibold" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        <span className="d-flex align-items-center gap-1"><Briefcase size={16} /> {viewingDoctor.specialization}</span>
                        <span>•</span>
                        <span className="d-flex align-items-center gap-1"><Mail size={16} /> {viewingDoctor.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {(viewingDoctor.status || '').toLowerCase() === 'active' ? (
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 16px' }}>Active</span>
                    ) : (viewingDoctor.status || '').toLowerCase() === 'inactive' ? (
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 16px' }}>Inactive</span>
                    ) : (
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '6px 16px' }}>Suspended</span>
                    )}
                  </div>
                </div>
                
                <div className="row g-5">
                  {/* Registration Details */}
                  <div className="col-12 col-md-6">
                    <h4 className="fw-bold mb-4" style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>REGISTRATION & CONTACT</h4>
                    <dl className="d-flex flex-column gap-3 m-0" style={{ fontSize: '0.95rem' }}>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Doctor ID</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>#{viewingDoctor.doctorId}</dd>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>License Number</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{viewingDoctor.licenseNumber}</dd>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0 d-flex align-items-center gap-2" style={{ color: '#64748b' }}><Phone size={16} style={{ color: '#94a3b8' }} /> Phone</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>{viewingDoctor.phone || '+1 234 567 8900'}</dd>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Experience</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>{viewingDoctor.experienceYears || '10+'} Years</dd>
                      </div>
                      <div className="d-flex justify-content-between pb-1 align-items-center mt-2">
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Consultation Fee</dt>
                        <dd className="fw-bold m-0 rounded-2 py-1 px-3" style={{ color: '#16a34a', backgroundColor: '#dcfce7', fontSize: '0.85rem' }}>${viewingDoctor.consultationFee || '150.00'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Uploaded Documents */}
                  <div className="col-12 col-md-6">
                    <h4 className="fw-bold mb-4" style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>VERIFICATION DOCUMENTS</h4>
                    <div className="d-flex flex-column gap-3">
                      {doctorDocuments.map((doc) => (
                        <div key={doc.id} className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                          <div className="d-flex align-items-center gap-3 overflow-hidden">
                            <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '42px', height: '42px', backgroundColor: '#eff6ff', color: '#2563EB' }}>
                              <FileText size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <div className="fw-bold text-truncate" style={{ color: '#0f172a', fontSize: '0.95rem' }}>{doc.name}</div>
                              <div className="text-truncate fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.8rem' }}>{doc.type} • {doc.date}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDownload(doc.name)} 
                            className="btn btn-sm ms-2 flex-shrink-0 d-flex align-items-center justify-content-center rounded-3" 
                            style={{ width: '36px', height: '36px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none' }}
                            title="Download Document"
                          >
                            <Download size={18} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer border-top px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <button 
                  onClick={() => setViewingDoctor(null)}
                  className="btn fw-bold rounded-3 px-4 py-2 shadow-sm"
                  style={{ border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#fff' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
