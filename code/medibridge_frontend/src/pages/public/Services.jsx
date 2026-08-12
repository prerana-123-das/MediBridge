import PublicNavbar from '../../components/layout/PublicNavbar'
import { Link } from 'react-router-dom'

export default function Services() {
  const services = [
    {
      title: 'Cardiology',
      desc: 'Expert heart care from board-certified cardiologists — EKGs, echocardiograms, hypertension management, and more.',
      tags: ['Heart Disease', 'Hypertension', 'Arrhythmia'],
      icon: '❤️',
      color: '#fecaca' // Light red
    },
    {
      title: 'Dermatology',
      desc: 'Skin, hair, and nail care from licensed dermatologists. Acne, eczema, psoriasis, and cosmetic consultations.',
      tags: ['Acne', 'Eczema', 'Skin Cancer Screening'],
      icon: '🧴',
      color: '#fde68a' // Light amber/yellow
    },
    {
      title: 'General Physician',
      desc: 'Your first stop for any health concern. Routine checkups, sick visits, referrals, and preventive care.',
      tags: ['Checkups', 'Fever & Flu', 'Preventive Care'],
      icon: '🩺',
      color: '#bfdbfe' // Light blue
    },
    {
      title: 'Orthopedics',
      desc: 'Bone, joint, and muscle care — from sports injuries and fractures to chronic back pain and arthritis.',
      tags: ['Sports Injuries', 'Joint Pain', 'Fractures'],
      icon: '🦴',
      color: '#fed7aa' // Light orange
    },
    {
      title: 'Pediatrics',
      desc: 'Gentle, expert care for children from newborns through teens — vaccinations, growth tracking, and more.',
      tags: ['Vaccinations', 'Growth & Development', 'Sick Visits'],
      icon: '👶',
      color: '#bbf7d0' // Light green
    },
    {
      title: 'Neurology',
      desc: 'Diagnosis and treatment of brain and nervous system conditions including migraines, epilepsy, and stroke.',
      tags: ['Migraines', 'Epilepsy', 'Stroke Care'],
      icon: '🧠',
      color: '#e9d5ff' // Light purple
    }
  ]

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-5 text-center" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div 
            className="d-inline-block rounded-pill px-3 py-1 mb-4 fw-bold text-uppercase" 
            style={{ backgroundColor: '#eff6ff', color: '#2563EB', fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            Our Services
          </div>
          <h1 className="fw-bolder mb-3" style={{ color: '#0f172a', fontSize: '3rem', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            Comprehensive care,<br />
            <span style={{ color: '#2563EB' }}>for every need</span>
          </h1>
          <p className="mx-auto" style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '42rem', lineHeight: '1.6' }}>
            From routine checkups to specialist consultations — we cover all aspects of your health.
          </p>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-4" style={{ paddingBottom: '6rem' }}>
        <div className="container">
          <div className="row g-4">
            {services.map((service) => (
              <div key={service.title} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card h-100 rounded-4 shadow-sm p-4 pt-5" 
                  style={{ backgroundColor: '#ffffff', border: `2px solid ${service.color}` }}
                >
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle" 
                      style={{ width: '48px', height: '48px', backgroundColor: '#f8fafc', fontSize: '1.5rem' }}
                    >
                      {service.icon}
                    </div>
                    <h3 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.15rem' }}>{service.title}</h3>
                  </div>
                  <p className="mb-4" style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {service.desc}
                  </p>
                  <div className="d-flex flex-wrap gap-2 mb-5">
                    {service.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="badge rounded-pill fw-medium" 
                        style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <Link to="/login" className="text-decoration-none fw-bold" style={{ color: '#2563EB', fontSize: '0.9rem' }}>
                      Book a consultation →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
