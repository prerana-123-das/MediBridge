import { useState } from 'react' 
import { Link, useNavigate } from 'react-router-dom' 
import { useDispatch, useSelector } from 'react-redux' 
import { Shield, Mail, Lock } from 'lucide-react' 
import { login } from '../../features/auth/authSlice' 
 
export default function AdminLoginPage() { 
  // Keep the admin's email and password together in one form state.
  const [form, setForm] = useState({ email: '', password: '' }) 
  const dispatch = useDispatch() 
  const navigate = useNavigate() 
  const { status, error } = useSelector((s) => s.auth) 
 
  // Submit the login request and move to the admin dashboard only when it succeeds.
  const submit = async (e) => { 
    e.preventDefault() 
    const res = await dispatch(login({ ...form, role: 'admin' })) 
    if (login.fulfilled.match(res)) navigate('/admin') 
  } 
 
  return ( 
    <div className="d-flex min-vh-100 align-items-center justify-content-center p-4 font-sans-custom" style={{ backgroundColor: '#0f172a' }}> 
      <div className="card w-100 border-0 shadow-lg" style={{ maxWidth: '400px', borderRadius: '1.25rem', padding: '2.5rem 2rem' }}> 
        <div className="d-flex flex-column align-items-center text-center"> 
          {/* Shield icon makes it clear that this is a restricted admin login. */}
          <div className="d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '56px', height: '56px', backgroundColor: '#ef4444', color: '#fff' }}> 
            <Shield size={26} strokeWidth={2} /> 
          </div> 
          <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '1.5rem' }}>Admin Portal</h1> 
          <p className="mt-1 mb-0 small" style={{ color: '#64748b' }}>Restricted access — administrators only</p> 
        </div> 
 
        {/* Show the authentication error returned from Redux when login fails. */}
        {error && ( 
          <div className="mt-4 rounded-3 p-3 small fw-semibold" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}> 
            {error} 
          </div> 
        )} 
 
        <form onSubmit={submit} className="mt-4 d-flex flex-column gap-4"> 
          <div> 
            <label className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '0.9rem' }}>Admin Email</label> 
            <div className="position-relative"> 
              <Mail className="position-absolute top-50 translate-middle-y" style={{ left: '12px', color: '#94a3b8' }} size={18} /> 
              <input  
                type="email"  
                required  
                placeholder="admin@medibridge.com" 
                value={form.email}  
                onChange={(e) => setForm({ ...form, email: e.target.value })}  
                className="form-control rounded-3 py-2 border"  
                style={{ paddingLeft: '38px', borderColor: '#cbd5e1', fontSize: '0.95rem' }} 
              /> 
            </div> 
          </div> 
           
          <div> 
            <label className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '0.9rem' }}>Password</label> 
            <div className="position-relative"> 
              <Lock className="position-absolute top-50 translate-middle-y" style={{ left: '12px', color: '#94a3b8' }} size={18} /> 
              <input  
                type="password"  
                required  
                placeholder="Enter your password" 
                value={form.password}  
                onChange={(e) => setForm({ ...form, password: e.target.value })}  
                className="form-control rounded-3 py-2 border"  
                style={{ paddingLeft: '38px', borderColor: '#cbd5e1', fontSize: '0.95rem' }} 
              /> 
            </div> 
          </div> 
 
          {/* Prevent multiple submissions while the login request is still running. */}
          <button  
            type="submit"  
            disabled={status === 'loading'} 
            className="btn w-100 fw-bold text-white rounded-3 py-2 mt-2"  
            style={{ backgroundColor: '#ef4444', fontSize: '0.95rem', opacity: status === 'loading' ? 0.6 : 1 }} 
          > 
            {status === 'loading' ? 'Signing in...' : 'Sign in to Admin Panel'} 
          </button> 
        </form> 
 
        {/* Give users a simple way to return to the normal login page. */}
        <div className="mt-4 text-center"> 
          <Link to="/login" className="text-decoration-none small fw-medium" style={{ color: '#64748b' }}> 
            ← Back to user login 
          </Link> 
        </div> 
      </div> 
    </div> 
  ) 
}