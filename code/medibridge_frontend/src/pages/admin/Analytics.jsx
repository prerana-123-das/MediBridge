import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminNav } from './adminNav'
import { fetchAdminAnalytics, fetchAdminPatients, fetchAdminDoctors } from '../../features/admin/adminSlice'
import axiosClient from '../../api/axiosClient'

// The Analytics & Reports page allows the admin to view high-level 
// business metrics and download detailed CSV data dumps of the system.
export default function Analytics() {
  const dispatch = useDispatch()
  
  // We need to pull the analytics data, AND the full lists of patients and doctors,
  // because we use those lists to generate the detailed CSV reports below.
  const analytics = useSelector((s) => s.admin.analytics)
  const patients = useSelector((s) => s.admin.patients) || []
  const doctors = useSelector((s) => s.admin.doctors) || []

  // Fetch all necessary data when the page loads
  useEffect(() => { 
    dispatch(fetchAdminAnalytics()) 
    dispatch(fetchAdminPatients())
    dispatch(fetchAdminDoctors())
  }, [dispatch])
  
  // Simple loading state if the backend hasn't responded yet
  if (!analytics) {
    return (
      <DashboardLayout badge="Admin" navItems={adminNav}>
        <div className="p-4 fw-semibold text-secondary">Loading...</div>
      </DashboardLayout>
    )
  }

  // Fallback defaults in case the backend sends incomplete data
  const { 
    monthly = { newPatients: 0, newDoctors: 0, totalAppointments: 0, completionRate: '0%' }, 
    revenue = { consultations: 0, followUps: 0, total: 0 } 
  } = analytics

  // This massive function handles building and downloading CSV files based on which button the admin clicked
  const generateReport = async (type) => {
    let headers = []
    let data = []
    let filename = ''
    
    // Build the Patient Report using the data we pulled from Redux
    if (type === 'patient') {
      headers = ['Patient ID', 'Full Name', 'Email', 'Phone', 'Address', 'Date of Birth', 'Gender', 'Blood Group', 'Appointments', 'Status', 'Created At']
      data = patients.map(p => [
        `#PT-${p.patientId}`, 
        p.fullName || '', 
        p.email || '', 
        p.phone || '', 
        (p.address || '').replace(/,/g, ''), // escape commas
        p.dateOfBirth || '', 
        p.gender || '', 
        p.bloodGroup || '', 
        p.appointments || 0, 
        p.status || 'active',
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
      ])
      filename = 'detailed_patient_report.csv'
    } else if (type === 'doctor') {
      headers = ['Doctor ID', 'Full Name', 'Email', 'Phone', 'Specialty', 'License Number', 'Experience (Years)', 'Consultation Fee ($)', 'Rating', 'Total Patients', 'Status', 'Created At']
      data = doctors.map(d => [
        d.doctorId, 
        d.fullName || '', 
        d.email || '', 
        d.phone || '', 
        d.specialization || '', 
        d.licenseNumber || '', 
        d.experienceYears || 0, 
        d.consultationFee || 0, 
        d.rating ? `${d.rating} (${d.ratingCount || 0} reviews)` : 'N/A', 
        d.patients || 0, 
        d.status || 'active',
        d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''
      ])
      filename = 'detailed_doctor_performance_report.csv'
    } else if (type === 'revenue') {
      // For the revenue report, we don't have the transaction data in Redux,
      // so we make a live API call specifically to get the raw payment data!
      try {
        const res = await axiosClient.get('/v1/payments/all');
        const transactions = res.data?.data || [];
        headers = ['Transaction ID', 'Appointment ID', 'Amount ($)', 'Payment Method', 'Status', 'Processed At']
        data = transactions.map(t => [
          `#TXN-${t.transactionId}`,
          `#APT-${t.appointmentId}`,
          t.amount || 0,
          t.paymentMethod || 'Unknown',
          t.status || 'Unknown',
          t.processedAt ? new Date(t.processedAt).toLocaleString() : ''
        ])
        filename = 'revenue_report.csv'
      } catch (e) {
        console.error("Failed to fetch revenue data", e);
        return;
      }
    }

    // Convert the 2D array of data into a comma-separated string,
    // wrapping each cell in quotes to prevent internal commas from breaking the columns.
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create a virtual file (Blob) and force the browser to download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const row = (label, value, accentColor) => (
    <div className="d-flex align-items-center justify-content-between py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
      <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.95rem' }}>{label}</span>
      <span className="fw-bolder" style={{ color: accentColor || '#0f172a', fontSize: '0.95rem' }}>{value}</span>
    </div>
  )

  return (
    <DashboardLayout badge="Admin" navItems={adminNav}>
      <h1 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '2rem' }}>Analytics & Reports</h1>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card rounded-4 p-4 shadow-sm border-0 h-100" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <h2 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Monthly Statistics</h2>
            <div className="d-flex flex-column" style={{ margin: '-12px 0' }}>
              {row('New Patients', monthly.newPatients)}
              {row('New Doctors', monthly.newDoctors)}
              {row('Total Appointments', monthly.totalAppointments.toLocaleString())}
              <div className="d-flex align-items-center justify-content-between py-3">
                <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.95rem' }}>Completion Rate</span>
                <span className="fw-bolder" style={{ color: '#16a34a', fontSize: '0.95rem' }}>{monthly.completionRate}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card rounded-4 p-4 shadow-sm border-0 h-100" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <h2 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Revenue Breakdown</h2>
            <div className="d-flex flex-column" style={{ margin: '-12px 0' }}>
              {row('Consultations', `$${revenue.consultations.toLocaleString()}`)}
              {row('Follow-ups', `$${revenue.followUps.toLocaleString()}`)}
              <div className="d-flex align-items-center justify-content-between py-3">
                <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.95rem' }}>Total Revenue</span>
                <span className="fw-bolder" style={{ color: '#2563EB', fontSize: '0.95rem' }}>${revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Generate Reports</h2>
        <div className="row g-3">
          <div className="col-12 col-sm-4">
            <button 
              onClick={() => generateReport('patient')} 
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fw-bold text-white shadow-sm"
              style={{ backgroundColor: '#2563EB', border: 'none', fontSize: '0.9rem' }}
            >
              <Download size={18} strokeWidth={2.5} /> Patient Report
            </button>
          </div>
          <div className="col-12 col-sm-4">
            <button 
              onClick={() => generateReport('doctor')} 
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fw-bold text-white shadow-sm"
              style={{ backgroundColor: '#16a34a', border: 'none', fontSize: '0.9rem' }}
            >
              <Download size={18} strokeWidth={2.5} /> Doctor Performance
            </button>
          </div>
          <div className="col-12 col-sm-4">
            <button 
              onClick={() => generateReport('revenue')} 
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fw-bold text-white shadow-sm"
              style={{ backgroundColor: '#a855f7', border: 'none', fontSize: '0.9rem' }}
            >
              <Download size={18} strokeWidth={2.5} /> Revenue Report
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
