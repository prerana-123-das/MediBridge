import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { doctorNav } from './doctorNav'
import { doctorService } from '../../services/doctorService'
import { specializations } from '../../utils/constants'

// The Settings page where doctors can update their professional info,
// change their passwords, configure consultation fees/durations, and link their Google account.
export default function DoctorSettings() {
  const user = useSelector((s) => s.auth.user)
  
  // State for the main professional and consultation settings
  const [profile, setProfile] = useState({
    fullName: '',
    specialization: 'Cardiology',
    licenseNumber: '',
    experienceYears: 0,
    email: '', // Usually disabled so they can't change their login email here
    phone: '',
    bio: '',
    consultationFee: 0,
    consultationDurationMin: 30
  })

  // State specifically for the Change Password form
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // State for managing inline validation errors and success messages
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  
  // Controls the loading spinner while fetching the initial data
  const [loading, setLoading] = useState(true)

  // Fetch the doctor's current profile from the backend as soon as they visit the page.
  // We map the snake_case API responses to camelCase to match our React state.
  useEffect(() => {
    if (user?.id) {
      doctorService.getDoctorProfile(user.id)
        .then((data) => {
          setProfile({
            fullName: data.fullName || data.full_name || '',
            specialization: data.specialization || 'Cardiology',
            licenseNumber: data.licenseNumber || data.license_number || '',
            experienceYears: data.experienceYears || data.experience_years || 0,
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            consultationFee: data.consultationFee || data.consultation_fee || 0,
            consultationDurationMin: data.consultationDurationMin || data.consultation_duration_min || 30
          })
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading doctor settings:", err)
          setLoading(false)
        })
    }
  }, [user?.id])

  // Universal handler for updating the profile form state
  // Also clears any existing error messages for the field being typed in
  const handleProfileChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setProfile({ ...profile, [e.target.name]: value })
    setProfileErrors({ ...profileErrors, [e.target.name]: '' })
    setProfileSuccess('')
  }

  // Universal handler for the password change form
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
    setPasswordErrors({ ...passwordErrors, [e.target.name]: '' })
    setPasswordSuccess('')
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone) => /^\+?[\d\s-]{10,}$/.test(phone)

  // Validates all inputs before sending the update request to the backend.
  // It handles both the "Professional Info" card and the "Consultation Settings" card at the bottom.
  const saveProfile = async () => {
    const errors = {}
    if (!profile.fullName) errors.fullName = 'Full name is required'
    if (!validateEmail(profile.email)) errors.email = 'Invalid email format'
    if (!validatePhone(profile.phone)) errors.phone = 'Invalid phone number (min 10 digits)'
    if (!profile.licenseNumber) errors.licenseNumber = 'License number is required'
    if (profile.experienceYears === '' || profile.experienceYears < 0) errors.experienceYears = 'Valid experience required'
    if (profile.consultationFee === '' || profile.consultationFee < 0) errors.consultationFee = 'Valid fee required'

    // Stop and show errors if any validation failed
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }
    
    try {
      await doctorService.updateDoctorProfile(profile)
      setProfileSuccess('Professional and consultation settings updated successfully!')
    } catch (err) {
      setProfileErrors({ global: 'Failed to update profile: ' + (err.response?.data?.message || err.message) })
    }
  }

  const validatePassword = (password) => password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password)

  // Handles strictly the password change logic independently from the profile save
  const updatePassword = async () => {
    const errors = {}
    if (!passwords.current) errors.current = 'Current password required'
    if (!validatePassword(passwords.new)) errors.new = 'Must be min 8 chars and include 1 special char'
    if (passwords.new !== passwords.confirm) errors.confirm = 'Passwords do not match'
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }
    
    try {
      // Dynamically import authService to avoid circular dependencies if any exist,
      // and hit the dedicated change-password API route.
      await import('../../services/authService').then(m => m.authService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      }))
      // Clear out the password fields on success
      setPasswords({ current: '', new: '', confirm: '' })
      setPasswordSuccess('Password updated successfully!')
    } catch (err) {
      setPasswordErrors({ global: 'Failed to update password: ' + (err.response?.data?.message || err.message) })
    }
  }

  if (loading) {
    return (
      <DashboardLayout badge="Doctor" navItems={doctorNav}>
        <div className="text-center py-5">Loading settings...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout badge="Doctor" navItems={doctorNav}>
      <h1 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Profile Settings</h1>

      <div className="card rounded-4 p-4 shadow-sm mb-4 border-0" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="h6 fw-bolder mb-4" style={{ color: '#0f172a' }}>Professional Information</h2>
        {profileSuccess && <div className="alert alert-success py-2">{profileSuccess}</div>}
        {profileErrors.global && <div className="alert alert-danger py-2">{profileErrors.global}</div>}
        
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Full Name</label>
            <input name="fullName" value={profile.fullName} onChange={handleProfileChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {profileErrors.fullName && <div className="text-danger small mt-1">{profileErrors.fullName}</div>}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Specialization</label>
            <select name="specialization" value={profile.specialization} onChange={handleProfileChange} className="form-select rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', cursor: 'pointer' }}>
              {specializations.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>License Number</label>
            <input name="licenseNumber" value={profile.licenseNumber} onChange={handleProfileChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {profileErrors.licenseNumber && <div className="text-danger small mt-1">{profileErrors.licenseNumber}</div>}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Experience (Years)</label>
            <input type="number" name="experienceYears" value={profile.experienceYears} onChange={handleProfileChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {profileErrors.experienceYears && <div className="text-danger small mt-1">{profileErrors.experienceYears}</div>}
          </div>
          
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Email</label>
            <input name="email" value={profile.email} onChange={handleProfileChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} disabled />
            {profileErrors.email && <div className="text-danger small mt-1">{profileErrors.email}</div>}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Phone</label>
            <input name="phone" value={profile.phone} onChange={handleProfileChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {profileErrors.phone && <div className="text-danger small mt-1">{profileErrors.phone}</div>}
          </div>
          
          <div className="col-12">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Bio</label>
            <textarea rows={3} name="bio" value={profile.bio} onChange={handleProfileChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
          </div>
        </div>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="h6 fw-bolder mb-4" style={{ color: '#0f172a' }}>Change Password</h2>
        {passwordSuccess && <div className="alert alert-success py-2">{passwordSuccess}</div>}
        {passwordErrors.global && <div className="alert alert-danger py-2">{passwordErrors.global}</div>}
        <div className="row g-4" style={{ maxWidth: '400px' }}>
          <div className="col-12">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Current Password</label>
            <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {passwordErrors.current && <div className="text-danger small mt-1">{passwordErrors.current}</div>}
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>New Password</label>
            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {passwordErrors.new && <div className="text-danger small mt-1">{passwordErrors.new}</div>}
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Confirm New Password</label>
            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1' }} />
            {passwordErrors.confirm && <div className="text-danger small mt-1">{passwordErrors.confirm}</div>}
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button onClick={updatePassword} className="btn btn-primary px-4 py-2 rounded-3 fw-bold border-0" style={{ backgroundColor: '#2563EB' }}>
            Update Password
          </button>
        </div>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Integrations</h2>
        
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ backgroundColor: '#f8fafc' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm" style={{ width: '48px', height: '48px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M21.53 7.11L21.53 7.11c-.56-.56-1.5-.56-2.07 0L17 9.57v4.86l2.46 2.46c.57.57 1.51.57 2.07 0l2.25-2.25c.57-.57.88-1.32.88-2.12v-.93c0-.8-.31-1.55-.88-2.12l-2.25-2.49z"/><path fill="#34A853" d="M11 14.43V20c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-5.57l-7 5.57z"/><path fill="#FBBC04" d="M2 14.43V20c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-5.57l-7 5.57z"/><path fill="#EA4335" d="M18 4h-3c-1.1 0-2 .9-2 2v5.57l7-5.57V6c0-1.1-.9-2-2-2z"/><path fill="#FFBA00" d="M9 4H6C4.9 4 4 4.9 4 6v5.57l7-5.57V4h-2z"/></svg>
              </div>
              <div>
                <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>Google Meet / Calendar</div>
                <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>Host your consultations on Google Meet</div>
              </div>
            </div>
            <button 
              onClick={() => window.open(`http://localhost:8080/api/v1/oauth2/authorize?doctorId=${user?.id}`, '_blank')}
              className="btn fw-bold rounded-3 px-4 py-2 shadow-sm"
              style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '0.9rem' }}
            >
              Connect Google Account
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-4 p-4 shadow-sm border-0" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 className="h6 fw-bolder mb-4" style={{ color: '#0f172a' }}>Consultation Settings</h2>
        
        <div className="d-flex flex-column gap-4 mb-4">
          <div>
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Consultation Fee ($ per session)</label>
            <input type="number" name="consultationFee" value={profile.consultationFee} onChange={handleProfileChange} className="form-control rounded-3 border py-2 pe-3 small" style={{ borderColor: '#cbd5e1' }} />
            {profileErrors.consultationFee && <div className="text-danger small mt-1">{profileErrors.consultationFee}</div>}
          </div>
          
          <div>
            <label className="form-label small fw-bold mb-2" style={{ color: '#334155' }}>Average Consultation Duration</label>
            <select name="consultationDurationMin" value={profile.consultationDurationMin} onChange={handleProfileChange} className="form-select rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', cursor: 'pointer' }}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
        
        <div>
          <button onClick={saveProfile} className="btn btn-primary px-3 py-2 small fw-bold rounded-3 border-0" style={{ backgroundColor: '#2563EB', fontSize: '0.875rem' }}>Save Changes</button>
        </div>
      </div>
    </DashboardLayout>
  )
}
