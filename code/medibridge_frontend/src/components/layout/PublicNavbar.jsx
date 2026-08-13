import { Link } from 'react-router-dom'
import Logo from '../common/Logo'

// Public navigation bar used on pages that don't require authentication.
export default function PublicNavbar({ hideLogin = false }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo takes the user back to the landing page. */}
        <Link to="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-8">
          {/* These links are hidden on smaller screens to keep the navbar clean. */}
          <Link
            to="/about"
            className="hidden text-sm font-medium text-slate-700 hover:text-primary-600 sm:block"
          >
            About
          </Link>

          <Link
            to="/services"
            className="hidden text-sm font-medium text-slate-700 hover:text-primary-600 sm:block"
          >
            Services
          </Link>

          <Link
            to="/contact"
            className="hidden text-sm font-medium text-slate-700 hover:text-primary-600 sm:block"
          >
            Contact
          </Link>

          {/* Some public pages may not need a Login button, so it can be hidden through a prop. */}
          {!hideLogin && (
            <Link
              to="/login"
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}