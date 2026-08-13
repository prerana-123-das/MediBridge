import { useEffect, useState } from 'react' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch, useSelector } from 'react-redux' 
import { Search, Star, User } from 'lucide-react' 
import DashboardLayout from '../../components/layout/DashboardLayout' 
import PublicNavbar from '../../components/layout/PublicNavbar' 
import { patientNav } from './patientNav' 
import { fetchDoctors } from '../../features/doctors/doctorsSlice' 
import { specializations } from '../../utils/constants' 
 
export default function FindDoctors() { 
  const dispatch = useDispatch() 
  const navigate = useNavigate() 
  const doctors = useSelector((s) => s.doctors.list) 
  const authUser = useSelector((s) => s.auth.user) 
  const [q, setQ] = useState('') 
  const [spec, setSpec] = useState('All Specializations') 
 
  // Get the latest doctor list when the page is opened.
  useEffect(() => { dispatch(fetchDoctors()) }, [dispatch]) 
 
  // Apply both search text and specialization filters to the doctor list.
  const filtered = doctors.filter((d) => { 
    if ((d.status || '').toLowerCase() === 'suspended') return false 
    const matchQ = `${d.fullName} ${d.specialization}`.toLowerCase().includes(q.toLowerCase()) 
    const matchS = spec === 'All Specializations' || d.specialization.includes(spec.replace('y', '')) 
    return matchQ && matchS 
  }) 
 
  const content = ( 
    <div className="font-sans-custom"> 
      <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Find Doctors</h1> 
      <p className="mt-1 mb-4" style={{ color: '#64748b' }}>Search for doctors by specialization</p> 
 
      <div className="card rounded-4 p-3 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}> 
        <div className="row g-3 align-items-center"> 
          <div className="col-12 col-sm-8 col-md-9"> 
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
          <div className="col-12 col-sm-4 col-md-3"> 
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
 
      <div className="d-flex flex-column gap-4"> 
        {/* Show each doctor with their basic details and current availability. */}
        {filtered.map((d) => ( 
          <div key={d.doctorId} className="card rounded-4 p-4 shadow-sm border-0" style={{ backgroundColor: (d.status || '').toLowerCase() === 'inactive' ? '#f8fafc' : '#fff', border: '1px solid #e2e8f0', opacity: (d.status || '').toLowerCase() === 'inactive' ? 0.6 : 1 }}> 
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-4"> 
              <div className="d-flex align-items-center gap-4"> 
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '56px', height: '56px', backgroundColor: (d.status || '').toLowerCase() === 'inactive' ? '#cbd5e1' : '#2563EB', color: '#fff' }}> 
                  <User size={24} strokeWidth={2} /> 
                </div> 
                <div> 
                  <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '1.1rem' }}>{d.fullName}</div> 
                  <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{d.specialization}</div> 
                  <div className="mt-2 d-flex flex-wrap align-items-center gap-3 small fw-semibold" style={{ color: '#94a3b8' }}> 
                    <span className="d-flex align-items-center gap-1 fw-bold" style={{ color: '#eab308' }}><Star size={14} fill="currentColor" /> {d.rating}</span> 
                    <span>• {d.experienceYears} years experience</span> 
                    <span className="fw-bold" style={{ color: '#2563EB' }}>• ${d.consultationFee}/session</span> 
                    {(d.status || '').toLowerCase() === 'inactive' ? ( 
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px' }}>Inactive</span> 
                    ) : d.available ? ( 
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 12px' }}>Available</span> 
                    ) : ( 
                      <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px' }}>Unavailable</span> 
                    )} 
                  </div> 
                </div> 
              </div> 
              <div className="d-flex align-items-center gap-3"> 
                {/* Open the doctor's profile without starting the booking flow. */}
                <button  
                  className="btn fw-bold rounded-3 px-4 py-2"  
                  style={{ border: '1px solid #2563EB', color: '#2563EB', backgroundColor: 'transparent', fontSize: '0.9rem' }}  
                  onClick={() => navigate(`/doctor/profile/${d.doctorId}`)} 
                > 
                  View Profile 
                </button> 
                <button  
                  className="btn fw-bold rounded-3 px-4 py-2 border-0 shadow-sm"  
                  style={d.available && (d.status || '').toLowerCase() !== 'inactive' ? { backgroundColor: '#2563EB', color: '#fff', fontSize: '0.9rem' } : { backgroundColor: '#e2e8f0', color: '#94a3b8', fontSize: '0.9rem', cursor: 'not-allowed' }} 
                  disabled={!d.available || (d.status || '').toLowerCase() === 'inactive'} 
                  onClick={() => { 
                    // Unauthenticated users need to log in before booking an appointment.
                    if (!authUser) { 
                      navigate('/login') 
                    } else { 
                      navigate('/patient/book', { state: { doctorId: d.doctorId, skipToDate: true } }) 
                    } 
                  }} 
                > 
                  Book Appointment 
                </button> 
              </div> 
            </div> 
          </div> 
        ))} 
      </div> 
    </div> 
  ) 
 
  // Public users get the public navbar, while logged-in patients use the dashboard layout.
  if (!authUser) { 
    return ( 
      <div className="min-vh-100 font-sans-custom" style={{ backgroundColor: '#F8FAFC' }}> 
        <PublicNavbar /> 
        <main className="container py-5"> 
          {content} 
        </main> 
      </div> 
    ) 
  } 
 
  return <DashboardLayout navItems={patientNav}>{content}</DashboardLayout> 
}