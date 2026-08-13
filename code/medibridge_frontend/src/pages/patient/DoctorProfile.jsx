import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Star, ArrowLeft } from 'lucide-react'
import PublicNavbar from '../../components/layout/PublicNavbar'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import { patientNav } from './patientNav'
import { fetchDoctors } from '../../features/doctors/doctorsSlice'

export default function DoctorProfile() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const doctors = useSelector((s) => s.doctors.list)
  const authUser = useSelector((s) => s.auth.user)
  const [doctor, setDoctor] = useState(null)

  // Load doctors only when the list is not already available in Redux.
  useEffect(() => {
    if (doctors.length === 0) {
      dispatch(fetchDoctors())
    } else {
      // Find the doctor whose ID matches the ID from the URL.
      const found = doctors.find(d => String(d.doctorId) === String(id))
      if (found) setDoctor(found)
    }
  }, [doctors, id, dispatch])

  const content = (
    <>
      {/* Let the user return to the previous page without hardcoding a route. */}
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back
      </button>

      {doctor ? (
        <Card className={`mx-auto max-w-2xl p-8 text-center sm:text-left ${(doctor.status || '').toLowerCase() === 'inactive' ? 'opacity-60 bg-slate-50' : ''}`}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="h-32 w-32 shrink-0 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=random`} alt={doctor.fullName} className="h-full w-full object-cover"/>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-slate-900">{doctor.fullName}</h1>
              <div className="mt-1 text-lg font-medium text-primary-600">{doctor.specialization}</div>
               
              {/* Show the main information patients usually check before booking. */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-600">
                  <Star size={14} fill="currentColor" /> {doctor.rating}
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                  {doctor.experienceYears || '10+'} Years Exp.
                </div>
                <div className="rounded-full bg-green-50 px-3 py-1 font-bold text-green-700">
                  ${doctor.consultationFee || '150'} / Consult
                </div>
                {(doctor.status || '').toLowerCase() === 'inactive' ? (
                  <div className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-500">
                    Inactive
                  </div>
                ) : !doctor.available && (
                  <div className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-500">
                    Unavailable
                  </div>
                )}
              </div>

              {/* Display the doctor's bio if one has been provided. */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-900">About Doctor</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{doctor.bio || 'No bio available.'}</p>
              </div>

              <div className="mt-8">
                {/* Prevent booking when the doctor is inactive or unavailable. */}
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  disabled={!doctor.available || (doctor.status || '').toLowerCase() === 'inactive'}
                  onClick={() => {
                    // Guests are sent to login first, while logged-in patients can book directly.
                    if (!authUser) {
                      navigate('/login', { state: { returnTo: '/patient/book', doctorId: doctor.doctorId, skipToDate: true } })
                    } else {
                      navigate('/patient/book', { state: { doctorId: doctor.doctorId, skipToDate: true } })
                    }
                  }}
                >
                  Book Appointment Now
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        // This also covers the short loading period while the doctor data is being fetched.
        <div className="py-20 text-center text-slate-500">Doctor not found or loading...</div>
      )}
    </>
  )

  // Public users see the profile with the public navbar instead of the patient dashboard.
  if (!authUser || authUser.role !== 'patient') {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <main className="mx-auto max-w-5xl px-6 py-12">
          {content}
        </main>
      </div>
    )
  }

  // Logged-in patients get the normal dashboard layout and patient navigation.
  return <DashboardLayout navItems={patientNav}>{content}</DashboardLayout>
}