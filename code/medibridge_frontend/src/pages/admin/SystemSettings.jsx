import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminNav } from './adminNav'

// The System Settings page where the admin can configure global platform behavior
// like the app name, support email, and security timeouts.
export default function SystemSettings() {
  
  // State to hold all the global settings. 
  // In a real app, you would fetch these from the backend inside a useEffect.
  const [settings, setSettings] = useState({
    platformName: 'MediBridge Healthcare',
    supportEmail: 'support@medibridge.com',
    maxAppointmentsPerDay: 50,
    sessionTimeout: '30 minutes'
  })
  
  // State for the save button animations/feedback
  const [isGeneralSaved, setIsGeneralSaved] = useState(false)
  const [isAllSaved, setIsAllSaved] = useState(false)
  
  // State for inline form validation
  const [emailError, setEmailError] = useState('')

  // Universal handler for updating the settings state.
  // It resets the "Saved!" button states back to default so the user knows they have unsaved changes.
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setIsGeneralSaved(false)
    setIsAllSaved(false)
    if (key === 'supportEmail') setEmailError('')
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handles saving just the "General Settings" block
  const handleGeneralSave = () => {
    if (!validateEmail(settings.supportEmail)) {
      setEmailError('Invalid email format')
      return
    }
    
    // Simulate a successful save by changing the button to "Saved Successfully" for 3 seconds
    setIsGeneralSaved(true)
    setTimeout(() => setIsGeneralSaved(false), 3000)
  }

  // Handles the global "Save All Settings" button at the very bottom
  const handleAllSave = () => {
    if (!validateEmail(settings.supportEmail)) {
      setEmailError('Invalid email format')
      return
    }
    
    // Simulate a successful save
    setIsAllSaved(true)
    setTimeout(() => setIsAllSaved(false), 3000)
  }

  return (
    <DashboardLayout badge="Admin" navItems={adminNav}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>System Settings</h1>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>General Settings</h2>
        
        <div className="d-flex flex-column gap-4" style={{ maxWidth: '42rem' }}>
          <div>
            <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Platform Name</label>
            <input 
              type="text" 
              className="form-control rounded-3 py-2 border shadow-none" 
              style={{ borderColor: '#cbd5e1', color: '#334155', fontSize: '0.95rem' }}
              value={settings.platformName} 
              onChange={(e) => handleChange('platformName', e.target.value)} 
            />
          </div>
          <div>
            <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Support Email</label>
            <input 
              type="email" 
              className="form-control rounded-3 py-2 border shadow-none" 
              style={{ borderColor: '#cbd5e1', color: '#334155', fontSize: '0.95rem' }}
              value={settings.supportEmail} 
              onChange={(e) => handleChange('supportEmail', e.target.value)} 
            />
            {emailError && <div className="text-danger small mt-1">{emailError}</div>}
          </div>
          <div>
            <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Maximum Appointments Per Day</label>
            <input 
              type="number" 
              className="form-control rounded-3 py-2 border shadow-none" 
              style={{ borderColor: '#cbd5e1', color: '#334155', fontSize: '0.95rem' }}
              value={settings.maxAppointmentsPerDay} 
              onChange={(e) => handleChange('maxAppointmentsPerDay', e.target.value)} 
            />
          </div>
          
          <div>
            <button 
              onClick={handleGeneralSave} 
              className="btn fw-bold text-white rounded-3 px-4 py-2 mt-2 shadow-sm"
              style={{ backgroundColor: isGeneralSaved ? '#16a34a' : '#2563EB', border: 'none', fontSize: '0.9rem', transition: 'all 0.3s' }}
            >
              {isGeneralSaved ? '✓ Saved Successfully' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Security Settings</h2>
        
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ backgroundColor: '#f8fafc' }}>
            <div>
              <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>Session Timeout</div>
              <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>Auto logout after inactivity</div>
            </div>
            <select 
              value={settings.sessionTimeout} 
              onChange={(e) => handleChange('sessionTimeout', e.target.value)} 
              className="form-select rounded-3 py-1 px-3 border shadow-none"
              style={{ width: 'auto', borderColor: '#cbd5e1', color: '#334155', fontSize: '0.9rem', minWidth: '130px', cursor: 'pointer' }}
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="60 minutes">60 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Integrations section removed to be placed in DoctorSettings */}      
      <div className="d-flex justify-content-end mb-5">
        <button 
          onClick={handleAllSave} 
          className="btn fw-bold text-white rounded-3 px-4 py-2 shadow-sm"
          style={{ backgroundColor: isAllSaved ? '#16a34a' : '#2563EB', border: 'none', fontSize: '0.9rem', transition: 'all 0.3s' }}
        >
          {isAllSaved ? '✓ All Settings Saved' : 'Save All Settings'}
        </button>
      </div>
    </DashboardLayout>
  )
}
