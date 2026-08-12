import { LogOut, User, Settings } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Avatar from '../common/Avatar'
import { logout } from '../../features/auth/authSlice'

// The top navigation bar shown once a user (Patient, Doctor, Admin) is logged in.
// It displays the brand logo on the left and the user's profile info and logout button on the right.
export default function DashboardTopbar({ badge }) {
  // Redux hook to trigger actions (like logging out)
  const dispatch = useDispatch()
  // React Router hook to move the user to different pages
  const navigate = useNavigate()
  
  // Grab the currently logged-in user's data from our Redux global state
  // If nobody is logged in somehow, we fall back to an empty object to avoid crashes
  const user = useSelector((s) => s.auth.user) || {}
  
  // Figure out what subtitle to show under the user's name based on their role
  const sub =
    user.role === 'doctor' ? user.specialization || 'Cardiologist'
    : user.role === 'admin' ? 'System Administrator'
    : 'Patient'
    
  // Quick helper to check if this is an admin user (we use this to change avatar colors later)
  const isAdmin = user.role === 'admin'

  // When the user clicks logout, we clear their session in Redux and kick them back to the login page
  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  return (
    // The main header wrapper. 'sticky-top' keeps it pinned to the top of the screen when scrolling.
    <header className="sticky-top bg-white border-bottom" style={{ zIndex: 1020, borderColor: '#e2e8f0' }}>
      <div className="d-flex align-items-center justify-content-between px-4 py-2">
        
        {/* Left Side: The Logo. Clicking it takes you back to your specific dashboard home */}
        <Link to={`/${user.role || ''}`} className="text-decoration-none">
          <Logo badge={badge} />
        </Link>
        
        {/* Right Side: User Profile and Actions */}
        <div className="d-flex align-items-center gap-3">

          {/* User Info Section (Avatar + Name) */}
          <div className="d-flex align-items-center gap-2">
            <Avatar color={isAdmin ? 'red' : 'blue'} size={36} icon={isAdmin ? Settings : User} />
            {/* We hide the name on super small screens (like phones) to save space */}
            <div className="d-none d-sm-block">
              <div className="small fw-bold lh-1" style={{ color: '#0f172a' }}>{user.name || 'John Doe'}</div>
              <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>{sub}</div>
            </div>
          </div>
          
          {/* Logout Button with a nice hover effect that turns it red */}
          <button onClick={handleLogout} className="btn btn-link p-1 border-0 ms-2" style={{ color: '#64748b', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'} onMouseOut={(e) => e.currentTarget.style.color = '#64748b'} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
