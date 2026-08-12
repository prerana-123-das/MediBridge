import { NavLink } from 'react-router-dom'

// This component handles the left sidebar navigation menu
// It expects an array of nav items and renders links based on that
export default function Sidebar({ items }) {
  return (
    <aside className="w-60 flex-shrink-0">
      {/* We wrap the links in a styled nav box so it looks clean against the layout background */}
      <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {/* Loop through each navigation item passed in the props */}
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            // We use NavLink's isActive property to highlight the currently selected page
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {/* Render the icon and the text label for the link */}
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
