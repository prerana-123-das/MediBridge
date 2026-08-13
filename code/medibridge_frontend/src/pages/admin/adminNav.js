import { Home, Users, UserCog, Calendar, TrendingUp, Settings } from 'lucide-react'

// This array defines the sidebar navigation links specifically for the Admin dashboard.
// Extracting it into this separate file keeps the layout component clean and makes it 
// very easy to add or reorder admin pages in the future.
export const adminNav = [
  // The 'end: true' property on the Overview link ensures it only highlights when the path is exactly '/admin', 
  // preventing it from remaining highlighted when the admin navigates to sub-pages like '/admin/patients'.
  { to: '/admin', label: 'Overview', icon: Home, end: true },
  { to: '/admin/patients', label: 'Manage Patients', icon: Users },
  { to: '/admin/doctors', label: 'Manage Doctors', icon: UserCog },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
]
