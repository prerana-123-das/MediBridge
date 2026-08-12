import DashboardTopbar from './DashboardTopbar'
import Sidebar from './Sidebar'

/**
 * DashboardLayout - A wrapper component that provides the common layout structure
 * for dashboard pages (e.g., patient, doctor, admin views).
 * 
 * @param {Object} props
 * @param {string} props.badge - The role badge to display in the topbar (e.g., 'Patient', 'Doctor')
 * @param {Array} props.navItems - List of navigation items for the sidebar
 * @param {React.ReactNode} props.children - The main content of the specific page
 */
export default function DashboardLayout({ badge, navItems, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navigation bar containing branding and user profile/badge */}
      <DashboardTopbar badge={badge} />
      
      {/* Main layout container for sidebar and page content */}
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        {/* Left-side navigation menu */}
        <Sidebar items={navItems} />
        
        {/* Dynamic page content injected here */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
