import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Shield, Activity, Plus } from 'lucide-react'
import PublicNavbar from '../../components/layout/PublicNavbar'
import Chatbot from '../../components/public/Chatbot'
import { fetchDoctors } from '../../features/doctors/doctorsSlice'
import heroBgImage from '../../assets/images/first_landing_page.jpg'
import specialistsBgImage from '../../assets/images/third_landing_page.jpg'

export default function LandingPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const doctors = useSelector((state) => state.doctors.list || [])

  // Load the available doctors when the landing page is opened.
  useEffect(() => {
    dispatch(fetchDoctors())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        className="relative pt-20 pb-24 text-center"
        style={{ 
          backgroundImage: `url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Adds a light overlay so the text remains easy to read over the background image. */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}></div>
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[#E0E7FF] px-4 py-1.5 text-sm font-semibold text-[#4F46E5]">
            <span className="mr-2">✦</span> Trusted by 12,000+ patients
          </div>
          
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Your Health,<br />
            <span className="text-[#2563EB]">Our Priority</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
            Connect with certified doctors online, book appointments instantly, and manage your health records securely — all in one place.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto rounded-lg bg-[#2563EB] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors">
              Book Appointment
            </Link>
            <Link to="/doctors" className="w-full sm:w-auto rounded-lg border border-[#2563EB] bg-transparent px-8 py-3.5 text-sm font-bold text-[#2563EB] hover:bg-blue-50 transition-colors">
              Find a Doctor
            </Link>
          </div>

          {/* Stats Card */}
          <div className="mt-16 mx-auto max-w-4xl rounded-2xl bg-white shadow-sm border border-slate-100 p-8 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
             <div className="flex-1 py-4 sm:py-0 text-center">
                <div className="text-3xl font-extrabold text-[#2563EB]">12,500+</div>
                <div className="mt-1 text-sm font-medium text-slate-400">Patients Served</div>
             </div>
             <div className="flex-1 py-4 sm:py-0 text-center">
                <div className="text-3xl font-extrabold text-[#2563EB]">150+</div>
                <div className="mt-1 text-sm font-medium text-slate-400">Expert Doctors</div>
             </div>
             <div className="flex-1 py-4 sm:py-0 text-center">
                <div className="text-3xl font-extrabold text-[#2563EB]">8 yrs</div>
                <div className="mt-1 text-sm font-medium text-slate-400">Of Excellence</div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Everything you need, in one place</h2>
            <p className="mt-3 text-slate-500">Healthcare made simple, secure, and human.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* Explains the appointment booking feature available to patients. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Easy Scheduling</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">Book appointments with doctors based on their specialization and availability in just a few clicks.</p>
            </div>
            
            {/* Highlights the option to manage medical documents and records. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Plus size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Medical Records</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">Upload and access your medical history, prescriptions, and reports securely from anywhere.</p>
            </div>

            {/* Highlights the security and privacy focus of the platform. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Secure & Private</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">Your health data is encrypted and protected with industry-standard security protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet our specialists */}
      <section 
        className="relative py-24"
        style={{ 
          backgroundImage: `url(${specialistsBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}></div>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Meet our specialists</h2>
              <p className="mt-2 text-slate-500">Highly rated, available today.</p>
            </div>
            <Link to="/doctors" className="rounded-lg border border-[#2563EB] bg-transparent px-6 py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors">
              View all doctors →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {doctors.length > 0 ? doctors.slice(0, 3).map((doctor, idx) => (
              <div key={doctor.doctorId} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden shrink-0">
                       <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=random`} alt={doctor.fullName} className="h-full w-full object-cover"/> 
                    </div> 
                    <div> 
                      <h3 className="font-bold text-slate-900">{doctor.fullName}</h3> 
                      <div className="text-sm font-medium text-[#2563EB]">{doctor.specialization}</div> 
                      <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500"> 
                        <span className="text-amber-400">★ {doctor.rating || '4.5'}</span> 
                        <span>{doctor.patients || '0'} patients</span> 
                      </div> 
                    </div> 
                  </div> 
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${idx === 1 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}> 
                    {idx === 1 ? 'Tomorrow' : 'Today'} 
                  </span> 
                </div> 
                
                {/* Sends the user to login while keeping the selected doctor and booking step. */}
                <Link to="/login" state={{ returnTo: '/patient/book', doctorId: doctor.doctorId, skipToDate: true }} className="mt-4 block w-full text-center rounded-lg bg-[#2563EB] py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"> 
                  Book Now 
                </Link> 
              </div> 
            )) : ( 
              <div className="col-span-3 text-center text-slate-500 py-8"> 
                Loading specialists... 
              </div> 
            )} 
          </div> 
        </div> 
      </section> 
 
      {/* How it works */} 
      <section className="bg-white py-24 text-center"> 
        <div className="mx-auto max-w-6xl px-6"> 
          <h2 className="text-3xl font-extrabold text-slate-900">How it works</h2> 
          <p className="mt-3 text-slate-500">Three steps to better healthcare.</p> 
           
          <div className="mt-16 grid gap-12 md:grid-cols-3 relative"> 
            {/* Step 1: the patient creates an account before using the platform. */}
            <div className="text-center relative z-10"> 
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] shadow-sm mb-6"> 
                <span className="text-2xl">👤</span> 
              </div> 
              <div className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] mb-2">STEP 01</div> 
              <h3 className="text-xl font-bold text-slate-900 mb-3">Create Account</h3> 
              <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Sign up in 60 seconds with your basic details.</p> 
            </div> 
 
            {/* Step 2: the patient searches for a suitable doctor. */}
            <div className="text-center relative z-10"> 
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] shadow-sm mb-6"> 
                <span className="text-2xl">🔍</span> 
              </div> 
              <div className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] mb-2">STEP 02</div> 
              <h3 className="text-xl font-bold text-slate-900 mb-3">Find a Doctor</h3> 
              <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Browse specialists by category or symptom.</p> 
            </div> 
 
            {/* Step 3: the patient selects a slot and attends the consultation. */}
            <div className="text-center relative z-10"> 
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] shadow-sm mb-6"> 
                <span className="text-2xl">📅</span> 
              </div> 
              <div className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] mb-2">STEP 03</div> 
              <h3 className="text-xl font-bold text-slate-900 mb-3">Book & Consult</h3> 
              <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Pick a slot and meet your doctor — online or in person.</p> 
            </div> 
          </div> 
        </div> 
      </section> 
 
      {/* CTA Section */} 
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-24 text-center"> 
        <div className="mx-auto max-w-4xl px-6"> 
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to take control of your health?</h2> 
          <p className="text-lg text-blue-100 mb-10">Join thousands of patients who trust MediBridge every day.</p> 
          <Link to="/login" className="inline-block rounded-lg bg-white px-10 py-3.5 text-sm font-bold text-[#2563EB] hover:bg-slate-50 transition-colors"> 
            Get Started 
          </Link> 
        </div> 
      </section> 
 
      {/* Footer */} 
      <footer className="bg-[#0F172A] py-16 text-sm text-slate-400"> 
        <div className="mx-auto max-w-6xl px-6"> 
          <div className="grid gap-12 md:grid-cols-3"> 
            <div> 
              <div className="flex items-center gap-2 text-xl font-extrabold text-white mb-6"> 
                <Activity className="text-[#3B82F6]" strokeWidth={3} /> MediBridge 
              </div> 
              <p className="max-w-xs leading-relaxed text-slate-400"> 
                Making quality healthcare accessible, simple, and human — for everyone. 
              </p> 
            </div> 
             
            <div> 
              <h3 className="font-extrabold text-white uppercase tracking-wider mb-6">Platform</h3> 
              <div className="flex flex-col gap-4"> 
                <Link to="/services" className="hover:text-white transition-colors">Services</Link> 
                <Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link> 
                <Link to="/login" className="hover:text-white transition-colors">Book Appointment</Link> 
              </div> 
            </div> 
             
            <div> 
              <h3 className="font-extrabold text-white uppercase tracking-wider mb-6">Company</h3> 
              <div className="flex flex-col gap-4"> 
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link> 
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link> 
              </div> 
            </div> 
          </div> 
           
          <div className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between border-t border-slate-800"> 
            <div>© 2025 MediBridge. All rights reserved.</div> 
            <div className="mt-4 md:mt-0 flex items-center gap-2"> 
              Built with care for patients everywhere <span className="text-blue-500">💙</span> 
            </div> 
          </div> 
        </div> 
      </footer> 
      <Chatbot /> 
    </div> 
  ) 
}