import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Input, { Field } from '../../components/common/Input'
import Logo from '../../components/common/Logo'
import PublicNavbar from '../../components/layout/PublicNavbar'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const emailParam = searchParams.get('email') || ''
  const tokenParam = searchParams.get('token') || ''
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState({ loading: false, success: false, error: '' })

  useEffect(() => {
    if (!emailParam || !tokenParam) {
      setStatus({ ...status, error: 'Invalid or missing password reset token.' })
    }
  }, [emailParam, tokenParam])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setStatus({ loading: false, success: false, error: 'Passwords do not match.' })
      return
    }

    setStatus({ loading: true, success: false, error: '' })
    
    try {
      // Calls the Spring Boot Identity Service
      const response = await fetch('http://localhost:8080/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, newPassword: password })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStatus({ loading: false, success: true, error: '' })
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setStatus({ loading: false, success: false, error: data.message || 'Failed to reset password.' })
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Network error. Make sure the Spring Boot service is running.' })
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 font-sans-custom">
      <PublicNavbar hideLogin={true} />
      <div className="row g-0 flex-grow-1">
        
        {/* Left branding panel */}
        <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}>
          <div className="px-5">
            <Logo size="lg" />
            <h1 className="mt-5 fw-bolder lh-sm" style={{ color: '#0f172a', fontSize: '2.5rem' }}>
              Secure Your Access
            </h1>
            <p className="mt-4 text-secondary" style={{ maxWidth: '400px' }}>
              Create a strong new password to protect your health records.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-4 p-sm-5">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="mb-4">
              <h2 className="h3 fw-bolder mb-2" style={{ color: '#0f172a' }}>Create New Password</h2>
              <p className="text-secondary small">Your new password must be different from previous used passwords.</p>
            </div>

            {status.success ? (
              <div className="alert alert-success border-0 rounded-3 small fw-medium text-center py-4" style={{ backgroundColor: '#ecfdf5', color: '#065f46' }}>
                <h4 className="fw-bold mb-2">Password Reset Successfully!</h4>
                <p className="mb-0">You will be redirected to the login page momentarily...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {status.error && (
                  <div className="alert alert-danger border-0 rounded-3 small fw-medium py-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                    {status.error}
                  </div>
                )}
                
                <Field label="New Password">
                  <Input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={!emailParam || !tokenParam}
                    required 
                    pattern="(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}" 
                    title="At least 8 characters, one uppercase, one digit, one special character"
                  />
                </Field>

                <Field label="Confirm New Password">
                  <Input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    disabled={!emailParam || !tokenParam}
                    required 
                  />
                </Field>
                
                <button 
                  type="submit" 
                  disabled={status.loading || !emailParam || !tokenParam}
                  className="btn btn-primary w-100 py-2 rounded-3 fw-bold mt-2 border-0" 
                  style={{ backgroundColor: '#2563EB' }}
                >
                  {status.loading ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
