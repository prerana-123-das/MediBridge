import PublicNavbar from '../../components/layout/PublicNavbar'
import { Link } from 'react-router-dom'

// The "About Us" page for the public-facing website.
// This page is a static marketing page designed to tell the story of MediBridge,
// show some quick stats to build trust, and highlight our core values.
export default function AboutUs() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <PublicNavbar />
      
      {/* 
        Hero Section: The big, attention-grabbing top part of the page.
        We split this into two columns: text on the left, and trust-building stat cards on the right. 
      */}
      <section className="py-5" style={{ paddingBottom: '4rem', paddingTop: '4rem' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div 
                className="d-inline-block rounded-pill px-3 py-1 mb-4 fw-bold" 
                style={{ backgroundColor: '#eff6ff', color: '#2563EB', fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                WHO WE ARE
              </div>
              <h1 className="fw-bolder mb-4" style={{ color: '#0f172a', fontSize: '3.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                Healthcare that actually <span style={{ color: '#2563EB' }}>feels human.</span>
              </h1>
              <p className="mb-4" style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                MediBridge was founded in 2016 with one simple belief: getting good healthcare shouldn't be a frustrating experience. We built a platform that puts patients first — simple to use, genuinely helpful, and designed around real people.
              </p>
              <Link 
                to="/login" 
                className="btn fw-bold text-white px-4 py-2 mt-2 rounded-3 text-decoration-none shadow-sm"
                style={{ backgroundColor: '#2563EB', border: 'none' }}
              >
                Get in touch
              </Link>
            </div>
            
            <div className="col-lg-6">
              <div className="row g-4">
                <div className="col-6">
                  <div className="card border-0 rounded-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ backgroundColor: '#ffffff' }}>
                    <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '2.25rem' }}>340+</div>
                    <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>Certified Doctors</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 rounded-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ backgroundColor: '#ffffff' }}>
                    <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '2.25rem' }}>12K+</div>
                    <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>Happy Patients</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 rounded-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
                    <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '2.25rem' }}>8 yrs</div>
                    <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>In Practice</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 rounded-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ backgroundColor: '#fffbeb' }}>
                    <div className="fw-bolder" style={{ color: '#0f172a', fontSize: '2.25rem' }}>4.9★</div>
                    <div className="fw-semibold mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        Values Section: A 4-column grid detailing what MediBridge stands for.
        These cards use a simple, clean design with emojis for icons to keep it friendly. 
      */}
      <section className="py-5" style={{ paddingBottom: '5rem' }}>
        <div className="container">
          <h2 className="fw-bolder mb-5" style={{ color: '#0f172a', fontSize: '2rem' }}>Our values</h2>
          <div className="row g-4">
            <div className="col-12 col-md-3">
              <div className="card h-100 border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.75rem' }}>🤝</div>
                <h3 className="fw-bold mt-4 mb-2" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Patient First</h3>
                <p className="mb-0 fw-medium" style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Every decision we make starts with what's best for the patient, not the platform.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card h-100 border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.75rem' }}>🔒</div>
                <h3 className="fw-bold mt-4 mb-2" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Privacy by Design</h3>
                <p className="mb-0 fw-medium" style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Your medical data is yours. We encrypt everything and never sell your information.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card h-100 border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.75rem' }}>⚡</div>
                <h3 className="fw-bold mt-4 mb-2" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Fast & Reliable</h3>
                <p className="mb-0 fw-medium" style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  We built MediBridge to work when you need it most — even when things get stressful.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card h-100 border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.75rem' }}>🌍</div>
                <h3 className="fw-bold mt-4 mb-2" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Accessible to All</h3>
                <p className="mb-0 fw-medium" style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Healthcare shouldn't depend on your zip code. We're building toward universal access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        Footer: The dark section at the very bottom of the page.
        Contains the logo, a quick tagline, and useful links for navigation. 
      */}
      <footer className="py-5" style={{ backgroundColor: '#0f172a', marginTop: '2rem' }}>
        <div className="container py-4">
          <div className="row g-5">
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 fw-bolder text-white" style={{ fontSize: '1.25rem' }}>
                <span style={{ color: '#f59e0b' }}>⚡</span> MediBridge
              </div>
              <p className="mt-3 mb-0 pe-4" style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Making quality healthcare accessible, simple, and human — for everyone.
              </p>
            </div>
            <div className="col-12 col-md-4">
              <div className="fw-bold text-white text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Platform</div>
              <div className="d-flex flex-column gap-2 mt-4">
                <Link to="/services" className="text-decoration-none" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Services</Link>
                <Link to="/patient/find-doctors" className="text-decoration-none" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Find Doctors</Link>
                <Link to="/login" className="text-decoration-none" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Book Appointment</Link>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="fw-bold text-white text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Company</div>
              <div className="d-flex flex-column gap-2 mt-4">
                <Link to="/about" className="text-decoration-none" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>About Us</Link>
                <Link to="/contact" className="text-decoration-none" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Contact</Link>
              </div>
            </div>
          </div>
          
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mt-5 pt-4 border-top" style={{ borderColor: '#1e293b' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>© 2026 MediBridge. All rights reserved.</div>
            <div className="mt-3 mt-md-0" style={{ color: '#64748b', fontSize: '0.85rem' }}>Built with care for patients everywhere 💙</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
