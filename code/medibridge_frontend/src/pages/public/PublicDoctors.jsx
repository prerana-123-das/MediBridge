import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Search } from 'lucide-react'
import PublicNavbar from '../../components/layout/PublicNavbar'
import { fetchDoctors } from '../../features/doctors/doctorsSlice'
import { specializations } from '../../utils/constants'

export default function PublicDoctors() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const doctors = useSelector((s) => s.doctors.list)
  const authUser = useSelector((s) => s.auth.user)
  const [q, setQ] = useState('')
  const [spec, setSpec] = useState('All Specializations')

  // Load the available doctors when the page is opened.
  useEffect(() => { dispatch(fetchDoctors()) }, [dispatch])

  // Filter out suspended doctors and apply the search and specialization filters.
  const filtered = doctors.filter((d) => {
    if ((d.status || '').toLowerCase() === 'suspended') return false
    const matchQ = `${d.fullName} ${d.specialization}`.toLowerCase().includes(q.toLowerCase())
    const matchS = spec === 'All Specializations' || d.specialization.includes(spec.replace('y', ''))
    return matchQ && matchS
  })

  return (
    <div className="min-vh-100 font-sans-custom" style={{ backgroundColor: '#F8FAFC' }}>
      <PublicNavbar />
      
      <main className="container py-5">
        <div className="mb-4 pb-2">
          <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2.25rem' }}>Our Doctors</h1>
          <p className="mt-2 mb-0" style={{ color: '#64748b', fontSize: '1.125rem' }}>Find the right specialist and book your appointment.</p>
        </div>

        {/* Search and specialization filters help patients quickly find a suitable doctor. */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-5" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-8">
              <div className="position-relative">
                <Search className="position-absolute top-50 translate-middle-y" style={{ left: '16px', color: '#94a3b8' }} size={20} />
                <input 
                  type="text" 
                  className="form-control rounded-3 py-2 border pe-3" 
                  style={{ paddingLeft: '44px', borderColor: '#cbd5e1' }}
                  placeholder="Search by doctor name or specialization..." 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <select 
                className="form-select rounded-3 py-2 border" 
                style={{ borderColor: '#cbd5e1', cursor: 'pointer' }}
                value={spec} 
                onChange={(e) => setSpec(e.target.value)}
              >
                <option>All Specializations</option>
                {specializations.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Display the filtered doctors as responsive cards. */}
        <div className="row g-4">
          {filtered.map((d) => (
            <div key={d.doctorId} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'transform 0.2s', backgroundColor: (d.status || '').toLowerCase() === 'inactive' ? '#f8fafc' : '#fff', opacity: (d.status || '').toLowerCase() === 'inactive' ? 0.6 : 1 }}>
                <div className="p-4 border-bottom" style={{ borderColor: '#f8fafc' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle overflow-hidden flex-shrink-0" style={{ width: '64px', height: '64px', border: '2px solid #e2e8f0' }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName)}&background=random&color=fff&size=64`} alt={d.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h3 className="h6 fw-bold m-0" style={{ color: '#0f172a' }}>{d.fullName}</h3>
                      <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{d.specialization}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="fw-bold" style={{ color: '#eab308', fontSize: '0.7rem' }}>★ {d.rating}</span>
                        <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.7rem' }}>{d.patients} patients</span>
                      </div>
                    </div>
                  </div>
                  {(d.status || '').toLowerCase() === 'inactive' ? (
                    <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 10px', fontSize: '0.65rem' }}>Inactive</span>
                  ) : d.available ? (
                    <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 10px', fontSize: '0.65rem' }}>Available</span>
                  ) : (
                    <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 10px', fontSize: '0.65rem' }}>Unavailable</span>
                  )}
                </div>
                 
                <div className="p-4">
                  <div className="d-flex gap-2 mb-4">
                    <div className="d-flex flex-column text-center p-2 rounded-3 w-100" style={{ backgroundColor: '#f8fafc' }}>
                      <span className="small text-muted mb-1">Experience</span>
                      <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.8rem' }}>{d.experienceYears || '10+'} Years</span>
                    </div>
                    <div className="d-flex flex-column text-center p-2 rounded-3 w-100" style={{ backgroundColor: '#f8fafc' }}>
                      <span className="small text-muted mb-1">Consultation</span>
                      <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.8rem' }}>${d.consultationFee || '150'}</span>
                    </div>
                  </div>
                   
                  <div className="d-flex gap-2">
                    {/* Open the doctor's profile for more detailed information. */}
                    <button className="btn w-100 py-2 fw-bold rounded-3" style={{ border: '1px solid #2563EB', color: '#2563EB', backgroundColor: 'transparent', fontSize: '0.8rem' }} onClick={() => navigate(`/doctor/profile/${d.doctorId}`)}>View Profile</button>
                    <button  
                      className="btn w-100 py-2 fw-bold rounded-3 border-0"  
                      style={d.available && (d.status || '').toLowerCase() !== 'inactive' ? { backgroundColor: '#2563EB', color: '#fff', fontSize: '0.8rem' } : { backgroundColor: '#e2e8f0', color: '#94a3b8', fontSize: '0.8rem', cursor: 'not-allowed' }}  
                      disabled={!d.available || (d.status || '').toLowerCase() === 'inactive'} 
                      onClick={() => { 
                        // Send unauthenticated users to login while keeping their booking details.
                        if (!authUser) { 
                          navigate('/login', { state: { returnTo: '/patient/book', doctorId: d.doctorId, skipToDate: true } }) 
                        } else { 
                          navigate('/patient/book', { state: { doctorId: d.doctorId, skipToDate: true } }) 
                        } 
                      }} 
                    > 
                      Book Now 
                    </button> 
                  </div> 
                </div> 
              </div> 
            </div> 
          ))} 
        </div> 
         
        {/* Show a message when no doctor matches the selected filters. */}
        {filtered.length === 0 && ( 
          <div className="py-5 mt-4 text-center rounded-4 border bg-white" style={{ borderColor: '#e2e8f0', color: '#64748b' }}> 
            No doctors found matching your criteria. 
          </div> 
        )} 
      </main> 
    </div> 
  ) 
}