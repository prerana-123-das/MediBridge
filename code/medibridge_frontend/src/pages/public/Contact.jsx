import PublicNavbar from '../../components/layout/PublicNavbar'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import axiosClient from '../../api/axiosClient'

// The Contact page allows public users to send messages or inquiries to the MediBridge team.
export default function Contact() {
  // Store the user's input from the form fields
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  
  // Track if we are currently sending the message to show a loading state on the button
  const [loading, setLoading] = useState(false)
  
  // Store success or error messages to display after submission
  const [feedback, setFeedback] = useState(null)

  // Update the formData state whenever the user types into any of the input fields
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  // Handle what happens when the user clicks "Send Message"
  const handleSubmit = async (e) => {
    e.preventDefault() // Stop the browser from refreshing the page
    setLoading(true) // Disable the button so they don't click it twice
    setFeedback(null) // Clear any previous success or error messages
    
    try {
      // Shoot the data over to our backend API
      await axiosClient.post('/public/contact', formData)
      
      // If it worked, show a green success box and clear the form fields
      setFeedback({ type: 'success', text: 'Your message has been sent successfully! We will get back to you soon.' })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      // If something broke on the server, show a red error box
      setFeedback({ type: 'error', text: 'Failed to send message. Please try again later.' })
    } finally {
      // Turn off the loading state regardless of what happened
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-5 text-center" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">
          <h1 className="fw-bolder mb-3" style={{ color: '#0f172a', fontSize: '3rem', letterSpacing: '-0.02em' }}>
            Get in touch
          </h1>
          <p className="mx-auto" style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '42rem' }}>
            Have a question, concern, or just want to say hello? We're here.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-4" style={{ paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div className="row g-5">
            {/* Left Column - Contact Info */}
            <div className="col-12 col-md-5">
              <h2 className="fw-bold mb-5" style={{ color: '#0f172a', fontSize: '1.5rem' }}>Contact information</h2>
              
              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '1.1rem' }}>
                    📍
                  </div>
                  <div>
                    <div className="fw-bold text-uppercase mb-1" style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Address</div>
                    <div className="fw-medium" style={{ color: '#0f172a', fontSize: '0.95rem' }}>Building 4, Street-A1, Pune, MH 94102</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#fce7f3', color: '#ec4899', fontSize: '1.1rem' }}>
                    📞
                  </div>
                  <div>
                    <div className="fw-bold text-uppercase mb-1" style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Phone</div>
                    <div className="fw-medium" style={{ color: '#0f172a', fontSize: '0.95rem' }}>+91 8171113538</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#f3e8ff', color: '#a855f7', fontSize: '1.1rem' }}>
                    ✉️
                  </div>
                  <div>
                    <div className="fw-bold text-uppercase mb-1" style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Email</div>
                    <div className="fw-medium" style={{ color: '#0f172a', fontSize: '0.95rem' }}>support@medibridge.com</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '1.1rem' }}>
                    🕒
                  </div>
                  <div>
                    <div className="fw-bold text-uppercase mb-1" style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hours</div>
                    <div className="fw-medium" style={{ color: '#0f172a', fontSize: '0.95rem' }}>Mon-Sun, 9am–5pm IST</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Form */}
            <div className="col-12 col-md-7">
              <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
                  {feedback && (
                    <div className={`p-3 rounded-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {feedback.text}
                    </div>
                  )}
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Your Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control rounded-3 py-2 border shadow-none" style={{ borderColor: '#cbd5e1' }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control rounded-3 py-2 border shadow-none" style={{ borderColor: '#cbd5e1' }} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Subject</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="form-control rounded-3 py-2 border shadow-none" style={{ borderColor: '#cbd5e1' }} />
                  </div>
                  
                  <div>
                    <label className="form-label fw-bold mb-2" style={{ color: '#334155', fontSize: '0.85rem' }}>Message</label>
                    <textarea rows="5" name="message" value={formData.message} onChange={handleChange} required className="form-control rounded-3 py-2 border shadow-none" style={{ borderColor: '#cbd5e1' }}></textarea>
                  </div>
                  
                  <div>
                    <button type="submit" disabled={loading} className="btn fw-bold text-white px-4 py-2 mt-2 rounded-3 shadow-sm" style={{ backgroundColor: '#2563EB', border: 'none', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
