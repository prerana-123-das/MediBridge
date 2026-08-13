import { useState } from 'react' 
import { Link, useNavigate, useLocation } from 'react-router-dom' 
import { useDispatch, useSelector } from 'react-redux' 
import { Mail, Lock, User, Stethoscope, Check } from 'lucide-react' 
import Logo from '../../components/common/Logo' 
import Input, { Field } from '../../components/common/Input' 
import { login } from '../../features/auth/authSlice' 
import PatientRegisterForm from './PatientRegisterForm' 
import DoctorRegisterForm from './DoctorRegisterForm' 
import PublicNavbar from '../../components/layout/PublicNavbar' 
 
// Features shown on the login page to highlight the platform's benefits.
const benefits = [ 
  { color: 'bg-blue-100 text-primary-600', textStyle: { color: '#2563eb' }, bgStyle: { backgroundColor: '#dbeafe' }, title: 'Secure & Encrypted', text: 'Your health data is protected with industry-standard security' }, 
  { color: 'bg-green-100 text-green-600', textStyle: { color: '#16a34a' }, bgStyle: { backgroundColor: '#dcfce7' }, title: '24/7 Access', text: 'Connect with healthcare professionals anytime, anywhere' }, 
  { color: 'bg-purple-100 text-purple-600', textStyle: { color: '#9333ea' }, bgStyle: { backgroundColor: '#f3e8ff' }, title: 'Easy Management', text: 'Manage appointments and records with a user-friendly interface' }, 
] 
 
export default function LoginPage() { 
  // Keeps track of the selected user role and whether the login or register form is shown.
  const [role, setRole] = useState('patient') 
  const [tab, setTab] = useState('login') 
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true }) 
  const dispatch = useDispatch() 
  const navigate = useNavigate() 
  const location = useLocation() 
  const { status, error } = useSelector((s) => s.auth) 
 
  // Handles login through Redux and redirects the user according to their role.
  const handleLogin = async (e) => { 
    e.preventDefault() 
    const res = await dispatch(login({ email: form.email, password: form.password, role, rememberMe: form.rememberMe })) 
    if (login.fulfilled.match(res)) { 
      // Return the patient to the page they originally wanted to access, if applicable.
      if (location.state?.returnTo && role === 'patient') { 
        navigate(location.state.returnTo, { state: location.state }) 
      } else { 
        navigate(role === 'doctor' ? '/doctor' : '/patient') 
      } 
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
              Welcome to Your Digital Healthcare Platform 
            </h1> 
            <p className="mt-4 text-secondary" style={{ maxWidth: '400px' }}> 
              Access your medical consultations, appointments, and health records securely from anywhere. 
            </p> 
            <div className="mt-5 d-flex flex-column gap-4"> 
              {benefits.map((b) => ( 
                <div key={b.title} className="d-flex gap-3"> 
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '32px', height: '32px', ...b.bgStyle, ...b.textStyle }}> 
                    <Check size={16} /> 
                  </div> 
                  <div> 
                    <div className="fw-bold" style={{ color: '#1e293b' }}>{b.title}</div> 
                    <div className="small text-secondary mt-1">{b.text}</div> 
                  </div> 
                </div> 
              ))} 
            </div> 
          </div> 
        </div> 
 
        {/* Right form panel */} 
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-4 p-sm-5"> 
          <div className="w-100" style={{ maxWidth: '400px' }}> 
            {/* Lets the user switch between patient and doctor accounts. */} 
            <div className="row g-2 mb-4"> 
              <div className="col-6"> 
                <button 
                  onClick={() => setRole('patient')} 
                  className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold border-0 ${ 
                    role === 'patient' ? 'btn-primary text-white' : 'btn-light text-secondary' 
                  }`} 
                  style={role === 'patient' ? { backgroundColor: '#2563EB' } : { backgroundColor: '#f1f5f9' }} 
                > 
                  <User size={16} /> Patient 
                </button> 
              </div> 
              <div className="col-6"> 
                <button 
                  onClick={() => setRole('doctor')} 
                  className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold border-0 ${ 
                    role === 'doctor' ? 'btn-primary text-white' : 'btn-light text-secondary' 
                  }`} 
                  style={role === 'doctor' ? { backgroundColor: '#2563EB' } : { backgroundColor: '#f1f5f9' }} 
                > 
                  <Stethoscope size={16} /> Doctor 
                </button> 
              </div> 
            </div> 
 
            {/* Login / Register tabs */} 
            <div className="d-flex gap-4 border-bottom mb-4" style={{ borderColor: '#e2e8f0' }}> 
              {['login', 'register'].map((t) => ( 
                <button 
                  key={t} 
                  onClick={() => setTab(t)} 
                  className="btn text-decoration-none fw-bold text-capitalize p-0 pb-2 rounded-0 bg-transparent shadow-none" 
                  style={{ 
                    color: tab === t ? '#2563EB' : '#94a3b8', 
                    border: 'none', 
                    borderBottom: tab === t ? '2px solid #2563EB' : '2px solid transparent', 
                    marginBottom: '-1px' 
                  }} 
                > 
                  {t} 
                </button> 
              ))} 
            </div> 
 
            {tab === 'login' ? ( 
              <form onSubmit={handleLogin}> 
                <h2 className="h4 fw-bolder mb-1" style={{ color: '#0f172a' }}>Welcome Back</h2> 
                <p className="small text-secondary mb-4">Login to your {role} account</p> 
 
                {error && <div className="alert alert-danger p-2 small mb-4">{error}</div>} 
 
                <div className="d-flex flex-column gap-3 mb-4"> 
                  <Field label="Email Address"> 
                    <Input icon={Mail} type="email" required placeholder="Enter your email" 
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /> 
                  </Field> 
                  <Field label="Password"> 
                    <Input icon={Lock} type="password" required placeholder="Enter your password" 
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /> 
                  </Field> 
                </div> 
 
                {/* Gives the user control over saving their login and provides password recovery. */} 
                <div className="d-flex align-items-center justify-content-between small mb-4"> 
                  <label className="d-flex align-items-center gap-2 text-secondary m-0"> 
                    <input type="checkbox" className="form-check-input m-0" style={{ borderColor: '#cbd5e1' }} checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} /> Remember me 
                  </label> 
                  <Link to="/forgot-password" className="fw-semibold text-decoration-none" style={{ color: '#2563EB' }}>Forgot Password?</Link> 
                </div> 
 
                <button type="submit" disabled={status === 'loading'} 
                  className="btn btn-primary w-100 py-2 rounded-3 fw-bold border-0 mb-4" 
                  style={{ backgroundColor: '#2563EB' }}> 
                  {status === 'loading' ? 'Signing in...' : 'Login'} 
                </button> 
 
              </form> 
            ) : role === 'patient' ? ( 
              // Shows the patient-specific registration form when the patient role is selected.
              <PatientRegisterForm /> 
            ) : ( 
              // Shows the doctor-specific registration form when the doctor role is selected.
              <DoctorRegisterForm /> 
            )} 
          </div> 
        </div> 
      </div> 
    </div> 
  ) 
}