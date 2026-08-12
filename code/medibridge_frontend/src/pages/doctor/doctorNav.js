import { Home, Calendar, Users, Clock, Settings } from 'lucide-react'

// This array defines the sidebar navigation links specifically for the Doctor's dashboard.
// We extract this into its own file so it's easy to add or remove pages later without cluttering the layout components.
export const doctorNav = [
  // The 'end: true' property on the Overview link ensures it only highlights when the path is exactly '/doctor', 
  // preventing it from staying highlighted when visiting sub-pages like '/doctor/appointments'.
  { to: '/doctor', label: 'Overview', icon: Home, end: true },
  { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { to: '/doctor/patients', label: 'Patient Records', icon: Users },
  { to: '/doctor/schedule', label: 'Schedule', icon: Clock },
  { to: '/doctor/settings', label: 'Settings', icon: Settings },
]
