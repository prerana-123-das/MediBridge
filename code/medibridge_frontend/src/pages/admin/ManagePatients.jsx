import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Eye, Power, X, Calendar, User, FileText, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminNav } from './adminNav'
import { fetchAdminPatients, fetchTogglePatientStatus } from '../../features/admin/adminSlice'
// The Manage Patients page where admins can view all registered users,
// search through them, filter by status, and deactivate problematic accounts.
export default function ManagePatients() {
  const dispatch = useDispatch()
  
  // Pull the master list of all patients from the Redux store
  const patients = useSelector((s) => s.admin.patients)
  
  // State for the text search bar
  const [q, setQ] = useState('')
  
  // State for the status dropdown filter (Active/Inactive)
  const [status, setStatus] = useState('All Status')
  
  // Controls the display of the Full Profile modal popup
  const [viewingPatient, setViewingPatient] = useState(null)

  // Fetch the latest patient list from the backend when the page loads
  useEffect(() => { dispatch(fetchAdminPatients()) }, [dispatch])

  // Filter the list of patients based on TWO things: 
  // 1. The search bar (checks name, email, and phone)
  // 2. The dropdown menu (checks active/inactive status)
  const rows = patients.filter((p) => {
    const mq = `${p.fullName} ${p.email} ${p.phone}`.toLowerCase().includes(q.toLowerCase())
    const currentStatus = p.status
    const ms = status === 'All Status' || (currentStatus || '').toLowerCase() === status.toLowerCase()
    return mq && ms // Both conditions must be true for the patient to show up!
  })

  // Flips a patient's account between active and inactive.
  const toggleStatus = (id, currentStatus) => {
    const newStatus = (currentStatus || '').toLowerCase() === 'active' ? 'inactive' : 'active'
    dispatch(fetchTogglePatientStatus({ id, status: newStatus }))
  }

  // Simulates downloading a patient's uploaded health record
  const handleDownload = (recordName) => {
    const element = document.createElement("a")
    const fileBlob = new Blob([`Mock document contents for ${recordName}\nGenerated securely from MediBridge System.`], {type: 'text/plain'})
    element.href = URL.createObjectURL(fileBlob)
    element.download = `${recordName.replace(/ /g, '_')}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <DashboardLayout badge="Admin" navItems={adminNav}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Manage Patients</h1>
      </div>

      {/* SECTION 1: The Search and Filter Bar */}
      <div className="card rounded-4 p-3 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-sm-9">
            <div className="position-relative">
              <Search className="position-absolute top-50 translate-middle-y" style={{ left: '16px', color: '#94a3b8' }} size={20} />
              <input 
                type="text" 
                className="form-control rounded-3 py-2 border pe-3" 
                style={{ paddingLeft: '44px', borderColor: '#cbd5e1' }}
                placeholder="Search patients by name, email, or phone..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
              />
            </div>
          </div>
          <div className="col-12 col-sm-3">
            <select 
              className="form-select rounded-3 py-2 border" 
              style={{ borderColor: '#cbd5e1', cursor: 'pointer' }}
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: The Patient Data Table */}
      <div className="card rounded-4 shadow-sm border-0 overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0" style={{ minWidth: '800px' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                {['Name', 'Email', 'Phone', 'Join Date', 'Appointments', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="border-0 fw-semibold py-4 px-4" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const currentStatus = (p.status || '').toLowerCase()
                return (
                  <tr key={p.patientId}>
                    <td className="px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#2563EB' }}>
                          <User size={18} strokeWidth={2} />
                        </div>
                        <span className="fw-bold" style={{ color: '#0f172a' }}>{p.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>{p.email}</td>
                    <td className="px-4 py-3 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>{p.phone}</td>
                    <td className="px-4 py-3 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-3 border-bottom fw-semibold small" style={{ borderColor: '#f1f5f9', color: '#64748b' }}>{p.appointments || 0}</td>
                    <td className="px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      {currentStatus === 'active' ? (
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 12px' }}>Active</span>
                      ) : (
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px' }}>Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      <div className="d-flex align-items-center gap-2">
                        <button 
                          onClick={() => setViewingPatient(p)} 
                          className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle" 
                          style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', color: '#2563EB', border: 'none' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle" 
                          style={{ 
                            width: '32px', height: '32px', border: 'none',
                            backgroundColor: currentStatus === 'active' ? '#fef3c7' : '#dcfce7',
                            color: currentStatus === 'active' ? '#f59e0b' : '#16a34a'
                          }}
                          title={currentStatus === 'active' ? 'Deactivate Account' : 'Activate Account'}
                          onClick={() => toggleStatus(p.patientId, currentStatus)}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-5 text-center fw-semibold" style={{ color: '#64748b' }}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 
        SECTION 3: Patient Full Profile Modal 
        This pops up when the admin clicks the blue 'Eye' icon on a patient row.
      */}
      {viewingPatient && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <h3 className="modal-title h6 fw-bolder m-0 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <User style={{ color: '#2563EB' }} size={18} /> Patient Full Profile
                </h3>
                <button type="button" className="btn-close" onClick={() => setViewingPatient(null)} style={{ fontSize: '0.8rem' }}></button>
              </div>
              
              <div className="modal-body p-4 p-md-5 bg-white">
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-4 border-bottom pb-4 mb-4" style={{ borderColor: '#f1f5f9' }}>
                  <div className="d-flex align-items-center gap-4">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', color: '#2563EB', borderRadius: '50%' }}>
                      <User size={32} strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.75rem', wordBreak: 'break-word' }}>{viewingPatient.fullName}</h2>
                      <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.95rem' }}>{viewingPatient.email}</div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {(viewingPatient.status || '').toLowerCase() === 'active' ? (
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 16px' }}>Active</span>
                    ) : (
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 16px' }}>Inactive</span>
                    )}
                  </div>
                </div>
                
                <div className="row g-5">
                  {/* Registration Details */}
                  <div className="col-12 col-md-6">
                    <h4 className="fw-bold mb-4" style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>REGISTRATION DETAILS</h4>
                    <dl className="d-flex flex-column gap-3 m-0" style={{ fontSize: '0.95rem' }}>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Patient ID</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>#PT-{viewingPatient.patientId}</dd>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Phone</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>{viewingPatient.phone}</dd>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0 d-flex align-items-center gap-2" style={{ color: '#64748b' }}><Calendar size={16} style={{ color: '#94a3b8' }} /> Date of Birth</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>{viewingPatient.dateOfBirth || 'N/A'}</dd>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-3" style={{ borderColor: '#f8fafc' }}>
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Gender</dt>
                        <dd className="fw-bolder m-0" style={{ color: '#0f172a' }}>{viewingPatient.gender || 'N/A'}</dd>
                      </div>
                      <div className="d-flex justify-content-between pb-1 align-items-center mt-2">
                        <dt className="fw-semibold m-0" style={{ color: '#64748b' }}>Blood Group</dt>
                        <dd className="fw-bold m-0 rounded-2 py-1 px-3" style={{ color: '#dc2626', backgroundColor: '#fef2f2', fontSize: '0.85rem' }}>{viewingPatient.bloodGroup || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="col-12 col-md-6">
                    <h4 className="fw-bold mb-4" style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>UPLOADED DOCUMENTS</h4>
                    <div className="d-flex flex-column gap-3">
                      {(viewingPatient.records || []).length > 0 ? (viewingPatient.records.map((doc) => (
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
                      ))) : (
                        <div className="text-center py-4 text-muted fw-semibold small">
                          No documents uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer border-top px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <button 
                  onClick={() => setViewingPatient(null)}
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
