import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, FileText, Activity, Clock, Download, User } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { patientNav } from './patientNav'
import { fetchPatientAppointments } from '../../features/appointments/appointmentsSlice'
import { fetchRecords, uploadRecordThunk } from '../../features/records/recordsSlice'
import { isAppointmentTimeReady, useTimeRefresh } from '../../utils/timeUtils'



export default function PatientOverview() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { upcoming, past } = useSelector((s) => s.appointments.patient)
  const records = useSelector((s) => s.records.list)
  const fileInputRef = useRef(null)

  useTimeRefresh()

  useEffect(() => {
    dispatch(fetchPatientAppointments())
    dispatch(fetchRecords())
  }, [dispatch])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64Str = ev.target.result
      
      const newRecord = {
        reportName: file.name,
        reportType: file.type.includes('image') ? 'Image' : file.type.includes('pdf') ? 'PDF Document' : 'Document',
        reportDataUrl: base64Str,
        fileSize: (file.size / 1024 / 1024).toFixed(1) + ' MB'
      }

      dispatch(uploadRecordThunk(newRecord))
    }
    reader.readAsDataURL(file)
    e.target.value = '' // reset input
  }

  const firstName = (user?.name || 'John Doe').replace('Dr. ', '').split(' ')[0]

  const handleDownload = (record) => {
    const fileUrl = record.reportDataUrl || record.fileUrl
    const rName = record.reportName || record.report_name
    const rType = record.reportType || record.report_type
    const rDate = record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : record.upload_date

    if (fileUrl && fileUrl.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = rName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      const element = document.createElement("a");
      const file = new Blob([`Mock contents for ${rName}\nType: ${rType}\nDate: ${rDate}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${rName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  return (
    <DashboardLayout navItems={patientNav}>
      <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Welcome back, {firstName}!</h1>
      <p className="mt-1 mb-4" style={{ color: '#64748b' }}>Here's your health overview</p>

      <div className="row g-4 mb-4 pb-2">
        {[
          { icon: Calendar, value: upcoming.length, label: 'Upcoming Appointments', bg: '#3b82f6' },
          { icon: FileText, value: records.length, label: 'Medical Records', bg: '#22c55e' },
          { icon: Activity, value: past ? past.length : 0, label: 'Completed Consultations', bg: '#a855f7' }
        ].map((s) => (
          <div key={s.label} className="col-12 col-md-4">
            <div className="rounded-4 p-4 text-white shadow-sm h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: s.bg, minHeight: '140px' }}>
              <s.icon size={22} strokeWidth={1.5} className="opacity-75" />
              <div>
                <div className="fw-bolder mt-4" style={{ fontSize: '2.5rem', lineHeight: '1' }}>{s.value}</div>
                <div className="small fw-semibold mt-1" style={{ opacity: 0.9 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Upcoming Appointments</h2>
          <Link to="/patient/appointments" className="small fw-bold text-decoration-none" style={{ color: '#2563EB' }}>View All</Link>
        </div>
        <div className="d-flex flex-column gap-3">
          {upcoming.slice(0, 2).map((a) => (
            <div key={a.appointment_id} className="d-flex align-items-center justify-content-between rounded-4 p-3 border" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563EB' }}>
                  <User size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{a.doctor}</div>
                  <div className="small fw-semibold mt-1" style={{ color: '#64748b' }}>{a.specialization}</div>
                </div>
              </div>
              <div className="d-none d-sm-block small fw-semibold" style={{ color: '#64748b' }}>
                <div className="d-flex align-items-center gap-2"><Calendar size={14} style={{ color: '#94a3b8' }} /> {a.appointment_date}</div>
                <div className="d-flex align-items-center gap-2 mt-1"><Clock size={14} style={{ color: '#94a3b8' }} /> {a.time}</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {a.status === 'Confirmed' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#e6f4ea', color: '#0d9488', padding: '6px 12px' }}>Confirmed</span>}
                {a.status === 'Pending' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#fef08a', color: '#b45309', padding: '6px 12px' }}>Pending</span>}
                {a.status !== 'Confirmed' && a.status !== 'Pending' && <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px' }}>{a.status}</span>}
                
                {a.status === 'Confirmed' && (
                  isAppointmentTimeReady(a.appointment_date, a.time) ? (
                    <button 
                      className="btn btn-sm fw-bold text-white rounded-3 px-3 py-1" 
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
                      Join
                    </button>
                  ) : (
                    <button 
                      className="btn btn-sm fw-bold text-white rounded-3 px-3 py-1 disabled" 
                      style={{ backgroundColor: '#94a3b8' }} 
                    >
                      Join
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Recent Medical Records</h2>
          <div className="d-flex align-items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="d-none" 
              onChange={handleFileChange} 
              accept="image/*,.pdf,.doc,.docx"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm d-flex align-items-center gap-1 rounded-3 fw-bold"
              style={{ backgroundColor: '#eff6ff', color: '#2563EB', border: '1px solid #bfdbfe' }}
            >
              Upload New
            </button>
            <Link to="/patient/records" className="small fw-bold text-decoration-none" style={{ color: '#2563EB' }}>View All</Link>
          </div>
        </div>
        <div className="d-flex flex-column gap-3">
          {records.slice(0, 3).map((r) => {
            const rId = r.reportId || r.report_id
            const rName = r.reportName || r.report_name
            const rDate = r.uploadDate ? new Date(r.uploadDate).toLocaleDateString() : r.upload_date
            const rSize = r.fileSize || r.size

            return (
            <div key={rId} className="d-flex align-items-center justify-content-between rounded-4 p-3 border" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '42px', height: '42px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#0f172a' }}>{rName}</div>
                  <div className="small fw-semibold mt-1" style={{ color: '#94a3b8' }}>{rDate} • {rSize}</div>
                </div>
              </div>
              <button onClick={() => handleDownload(r)} className="btn btn-sm border-0 rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#dcfce7', color: '#16a34a', width: '36px', height: '36px' }} title="Download">
                <Download size={18} strokeWidth={2} />
              </button>
            </div>
          )})}
        </div>
      </div>
    </DashboardLayout>
  )
}
