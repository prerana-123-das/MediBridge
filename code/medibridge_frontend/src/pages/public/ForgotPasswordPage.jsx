import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input, { Field } from '../../components/common/Input'
import { ArrowLeft, Check } from 'lucide-react'
import Logo from '../../components/common/Logo'
import PublicNavbar from '../../components/layout/PublicNavbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ loading: false, success: false, error: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, success: false, error: '' })
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/email/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus({ loading: false, success: true, error: '' })
      } else {
        setStatus({ loading: false, success: false, error: data.message || 'Failed to send reset instructions.' })
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Network error. Make sure the .NET Email Service is running.' })
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
              Regain Access to Your Account
            </h1>
            <p className="mt-4 text-secondary" style={{ maxWidth: '400px' }}>
              Securely reset your password and get back to managing your health.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-4 p-sm-5">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <Link to="/login" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4 small fw-semibold" style={{ color: '#64748b' }}>
              <ArrowLeft size={16} /> Back to login
            </Link>
            
            <div className="mb-4">
              <h2 className="h3 fw-bolder mb-2" style={{ color: '#0f172a' }}>Forgot Password</h2>
              <p className="text-secondary small">Enter your email address and we'll send you instructions to reset your password.</p>
            </div>

            {status.success ? (
              <div className="alert alert-success border-0 rounded-3 small fw-medium" style={{ backgroundColor: '#ecfdf5', color: '#065f46' }}>
                Password reset instructions have been sent to <strong>{email}</strong>. Please check your inbox (or terminal logs if using dummy SMTP credentials).
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {status.error && (
                  <div className="alert alert-danger border-0 rounded-3 small fw-medium py-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                    {status.error}
                  </div>
                )}
                
                <Field label="Email Address">
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </Field>
                
                <button 
                  type="submit" 
                  disabled={status.loading}
                  className="btn btn-primary w-100 py-2 rounded-3 fw-bold mt-2 border-0" 
                  style={{ backgroundColor: '#2563EB' }}
                >
                  {status.loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
