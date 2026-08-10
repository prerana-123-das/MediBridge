import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Input, { Field } from '../../components/common/Input'
import { registerDoctor } from '../../features/auth/authSlice'
import { specializations } from '../../utils/constants'

export default function DoctorRegisterForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [f, setF] = useState({
    fullName: '', email: '', phone: '', password: '', specialization: 'Cardiology',
    licenseNumber: '', experienceYears: '', consultationFee: '', consultationDurationMin: 30, bio: '',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const res = await dispatch(registerDoctor(f))
    if (registerDoctor.fulfilled.match(res)) {
      try {
        await fetch('http://localhost:8080/api/v1/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({

            fullName: f.fullName,
            recipientEmail: f.email,
            role: 'Doctor'
          })
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }
      navigate('/doctor')
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="h4 fw-bolder mb-1" style={{ color: '#0f172a' }}>Create Doctor Account</h2>
      <p className="small text-secondary mb-4">Join MediBridge as a healthcare provider</p>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6">
          <Field label="Full Name"><Input required value={f.fullName} onChange={set('fullName')} placeholder="Dr. Sarah Johnson" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Email"><Input required type="email" value={f.email} onChange={set('email')} placeholder="you@medibridge.com" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Phone"><Input required value={f.phone} onChange={set('phone')} placeholder="+1 234 567 8900" pattern="^[0-9]{10}$" title="Phone number must be exactly 10 digits" maxLength="10" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Specialization">
            <select className="form-select rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', color: '#0f172a' }} value={f.specialization} onChange={set('specialization')}>
              {specializations.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="License Number"><Input required value={f.licenseNumber} onChange={set('licenseNumber')} placeholder="MD123452020" pattern="^[A-Za-z0-9]{1,12}$" title="Maximum 12 alphanumeric characters" maxLength="12" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Experience (Years)"><Input required type="number" min="1" value={f.experienceYears} onChange={set('experienceYears')} placeholder="15" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Consultation Fee ($)"><Input required type="number" value={f.consultationFee} onChange={set('consultationFee')} placeholder="150" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Avg. Duration (min)">
            <select className="form-select rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', color: '#0f172a' }} value={f.consultationDurationMin} onChange={set('consultationDurationMin')}>
              <option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option>
            </select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Password"><Input required type="password" value={f.password} onChange={set('password')} placeholder="Create a password" pattern="(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}" title="At least 8 characters, one uppercase, one digit, one special character" /></Field>
        </div>
      </div>
      
      <div className="mb-4">
        <Field label="Bio">
          <textarea rows={3} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', color: '#0f172a' }} value={f.bio} onChange={set('bio')} placeholder="Tell patients about your experience and specialties" maxLength="200" required />
        </Field>
      </div>

      <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold border-0" style={{ backgroundColor: '#2563EB' }}>
        Create Account
      </button>
    </form>
  )
}
