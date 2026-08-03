import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { patientNav } from './patientNav'
import { patientService } from '../../services/patientService'

export default function PatientSettings() {
  const user = useSelector((s) => s.auth.user)
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: ''
  })
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      patientService.getPatientProfile(user.id)
        .then((data) => {
          setProfile({
            fullName: data.fullName || data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
            address: data.address || '',
            bloodGroup: data.bloodGroup || data.blood_group || ''
          })
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading patient settings:", err)
          setLoading(false)
        })
    }
  }, [user?.id])
  
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
    setProfileErrors({ ...profileErrors, [e.target.name]: '' })
    setProfileSuccess('')
  }

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
    setPasswordErrors({ ...passwordErrors, [e.target.name]: '' })
    setPasswordSuccess('')
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone) => {
    return /^\+?[\d\s-]{10,}$/.test(phone)
  }

  const validatePassword = (password) => {
    return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const saveProfile = async () => {
    const errors = {}
    if (!profile.fullName) errors.fullName = 'Full name is required'
    if (!validateEmail(profile.email)) errors.email = 'Invalid email format'
    if (!validatePhone(profile.phone)) errors.phone = 'Invalid phone number (min 10 digits)'
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }
    
    try {
      await patientService.updatePatientProfile(user.id, profile)
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      setProfileErrors({ global: 'Failed to update profile: ' + (err.response?.data?.message || err.message) })
    }
  }

  const updatePassword = () => {
    const errors = {}
    if (!passwords.current) errors.current = 'Current password required'
    if (!validatePassword(passwords.new)) errors.new = 'Must be min 8 chars and include 1 special char'
    if (passwords.new !== passwords.confirm) errors.confirm = 'Passwords do not match'
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }
    
    setPasswords({ current: '', new: '', confirm: '' })
    setPasswordSuccess('Password updated successfully!')
  }

  if (loading) {
    return (
      <DashboardLayout navItems={patientNav}>
        <div className="text-center py-5">Loading settings...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={patientNav}>
      <h1 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Settings</h1>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 fw-bold mb-4" style={{ color: '#0f172a' }}>Profile Information</h2>
        {profileSuccess && <div className="alert alert-success py-2">{profileSuccess}</div>}
        {profileErrors.global && <div className="alert alert-danger py-2">{profileErrors.global}</div>}
        <div className="row g-4">
          <div className="col-sm-6">
            <label className="form-label small fw-semibold text-secondary mb-1">Full Name</label>
            <input name="fullName" value={profile.fullName} onChange={handleProfileChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
            {profileErrors.fullName && <div className="text-danger small mt-1">{profileErrors.fullName}</div>}
          </div>
          <div className="col-sm-6">
            <label className="form-label small fw-semibold text-secondary mb-1">Email</label>
            <input name="email" value={profile.email} onChange={handleProfileChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
            {profileErrors.email && <div className="text-danger small mt-1">{profileErrors.email}</div>}
          </div>
          <div className="col-sm-6">
            <label className="form-label small fw-semibold text-secondary mb-1">Phone Number</label>
            <input name="phone" value={profile.phone} onChange={handleProfileChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
            {profileErrors.phone && <div className="text-danger small mt-1">{profileErrors.phone}</div>}
          </div>
          <div className="col-sm-6">
            <label className="form-label small fw-semibold text-secondary mb-1">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleProfileChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button onClick={saveProfile} className="btn btn-primary px-4 py-2 rounded-3 fw-bold border border-2 border-primary" style={{ backgroundColor: '#2563EB', borderColor: '#1d4ed8' }}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 fw-bold mb-4" style={{ color: '#0f172a' }}>Change Password</h2>
        {passwordSuccess && <div className="alert alert-success py-2">{passwordSuccess}</div>}
        <div className="row g-4" style={{ maxWidth: '400px' }}>
          <div className="col-12">
            <label className="form-label small fw-semibold text-secondary mb-1">Current Password</label>
            <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
            {passwordErrors.current && <div className="text-danger small mt-1">{passwordErrors.current}</div>}
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold text-secondary mb-1">New Password</label>
            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
            {passwordErrors.new && <div className="text-danger small mt-1">{passwordErrors.new}</div>}
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold text-secondary mb-1">Confirm New Password</label>
            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="form-control rounded-3 p-2" style={{ borderColor: '#e2e8f0' }} />
            {passwordErrors.confirm && <div className="text-danger small mt-1">{passwordErrors.confirm}</div>}
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button onClick={updatePassword} className="btn btn-primary px-4 py-2 rounded-3 fw-bold border border-2 border-primary" style={{ backgroundColor: '#2563EB', borderColor: '#1d4ed8' }}>
            Update Password
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
