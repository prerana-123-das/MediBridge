import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import Input, { Field } from '../../components/common/Input'
import { registerPatient } from '../../features/auth/authSlice'

export default function PatientRegisterForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [f, setF] = useState({
    fullName: '', email: '', phone: '', anotherNumber: '', password: '',
    dateOfBirth: '', gender: 'Male', bloodGroup: 'O+', address: '', reasonOfConsult: '',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const res = await dispatch(registerPatient(f))
    if (registerPatient.fulfilled.match(res)) {
      try {
        await fetch('http://localhost:8080/api/v1/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({

            fullName: f.fullName,
            recipientEmail: f.email,
            role: 'Patient'
          })
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }

      if (location.state?.returnTo) {
        navigate(location.state.returnTo, { state: location.state })
      } else {
        navigate('/patient')
      }
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="h4 fw-bolder mb-1" style={{ color: '#0f172a' }}>Create Patient Account</h2>
      <p className="small text-secondary mb-4">Register to manage your health</p>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6">
          <Field label="Full Name"><Input required value={f.fullName} onChange={set('fullName')} placeholder="John Doe" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Email"><Input required type="email" value={f.email} onChange={set('email')} placeholder="you@email.com" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Phone Number"><Input required value={f.phone} onChange={set('phone')} placeholder="+1 234 567 8900" pattern="^[0-9]{10}$" title="Phone number must be exactly 10 digits" maxLength="10" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Alternate Number"><Input value={f.anotherNumber} onChange={set('anotherNumber')} placeholder="Optional" pattern="^[0-9]{10}$" title="Phone number must be exactly 10 digits" maxLength="10" /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Date of Birth"><Input required type="date" value={f.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Gender">
            <select className="form-select rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', color: '#0f172a' }} value={f.gender} onChange={set('gender')}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Blood Group">
            <select className="form-select rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', color: '#0f172a' }} value={f.bloodGroup} onChange={set('bloodGroup')}>
              {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field label="Password"><Input required type="password" value={f.password} onChange={set('password')} placeholder="Create a password" pattern="(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}" title="At least 8 characters, one uppercase, one digit, one special character" /></Field>
        </div>
      </div>
      
      <div className="d-flex flex-column gap-3 mb-4">
        <Field label="Address"><Input required value={f.address} onChange={set('address')} placeholder="Street, City, State" maxLength="70" /></Field>
        <Field label="Reason for Consultation">
          <textarea rows={2} className="form-control rounded-3 border px-3 py-2 small" style={{ borderColor: '#cbd5e1', color: '#0f172a' }} value={f.reasonOfConsult} onChange={set('reasonOfConsult')} placeholder="Briefly describe your concern" maxLength="200" required />
        </Field>
      </div>

      <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold border-0" style={{ backgroundColor: '#2563EB' }}>
        Create Account
      </button>
    </form>
  )
}
