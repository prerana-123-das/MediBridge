import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Guards routes by authentication + role. Mirrors the RBAC described in the schema notes.
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const location = useLocation()

  console.log("ProtectedRoute Debug:", { 
    requiredRole: role, 
    userRole: user?.role, 
    isAuthenticated, 
    userObject: user 
  });

  if (!isAuthenticated) {
    console.warn("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (role && user?.role !== role) {
    console.warn(`ProtectedRoute: Role mismatch (expected: ${role}, got: ${user?.role}), redirecting to /login`);
    return <Navigate to="/login" replace />
  }
  
  return children
}
