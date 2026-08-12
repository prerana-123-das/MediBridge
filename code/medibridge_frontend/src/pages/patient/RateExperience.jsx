import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { rateConsultation } from '../../features/appointments/appointmentsSlice'
import { Star, Clock, Calendar, Smile, Meh, Frown, Check, ThumbsUp, Send, User } from 'lucide-react'
import DashboardTopbar from '../../components/layout/DashboardTopbar'

const RatingStars = ({ rating, setRating, size = 40, className = '' }) => {
  const [hover, setHover] = useState(0)
  return (
    <div className={`flex gap-2 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button 
          key={n} 
          type="button"
          onMouseEnter={() => setHover(n)} 
          onMouseLeave={() => setHover(0)} 
          onClick={() => setRating(n)}
        >
          <Star 
            size={size} 
            className={(hover || rating) >= n ? 'text-blue-600' : 'text-slate-200'} 
            fill={(hover || rating) >= n ? 'currentColor' : 'none'} 
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

const StepCircle = ({ num }) => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
    {num}
  </div>
)

export default function RateExperience() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const appointment = location.state?.appointment || null

  const [overallRating, setOverallRating] = useState(0)
  const [overallExperience, setOverallExperience] = useState('')
  const [aspects, setAspects] = useState({ punctuality: 0, communication: 0, knowledge: 0, care: 0 })
  const [tags, setTags] = useState([])
  const [review, setReview] = useState('')
  const [recommend, setRecommend] = useState(null)
  const [anonymous, setAnonymous] = useState(false)

  const toggleTag = (t) => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert("Please provide an overall star rating.");
      return;
    }
    if (appointment) {
      try {
        await dispatch(rateConsultation({ id: appointment.appointment_id, score: overallRating })).unwrap();
        alert('Thank you! Your review has been submitted and will reflect on the doctor\'s profile.');
        navigate('/patient/appointments');
      } catch (err) {
        alert('Failed to submit review.');
      }
    } else {
      alert('Error: No appointment found to rate.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <DashboardTopbar />
      
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Rate Your Experience</h1>
          <p className="text-sm text-slate-500">Your feedback helps improve care for everyone</p>
        </div>

        <div className="space-y-4">
          {/* Doctor Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 text-lg">
                {appointment ? appointment.doctor.substring(0, 2).toUpperCase() : 'DR'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{appointment ? appointment.doctor : 'Dr. Sarah Johnson'}</h3>
                <div className="text-sm font-medium text-blue-600 mb-1">{appointment ? appointment.specialization : 'Cardiologist'}</div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {appointment ? appointment.appointment_date : '2026-04-13'}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {appointment ? appointment.time : '10:00 AM'}</span>
                </div>
              </div>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Consultation Complete
            </div>
          </div>

          {/* Step 1: Overall Rating */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <StepCircle num="1" />
              <h2 className="font-bold text-slate-900">Overall Rating</h2>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              <RatingStars rating={overallRating} setRating={setOverallRating} size={48} />
              <p className="text-xs text-slate-400 mt-3 font-medium">Tap a star to rate</p>
            </div>
          </div>

          {/* Step 2: Overall Experience */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <StepCircle num="2" />
              <h2 className="font-bold text-slate-900">How was your overall experience?</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Excellent', icon: Smile },
                { label: 'Good', icon: Smile },
                { label: 'Okay', icon: Meh },
                { label: 'Poor', icon: Frown },
              ].map((exp) => (
                <button
                  key={exp.label}
                  onClick={() => setOverallExperience(exp.label)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
                    overallExperience === exp.label 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <exp.icon size={24} className="mb-2" />
                  <span className="text-sm font-semibold">{exp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Specific Aspects */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <StepCircle num="3" />
              <h2 className="font-bold text-slate-900">Rate specific aspects</h2>
            </div>
            <div className="space-y-6">
              {[
                { id: 'punctuality', title: 'Punctuality', desc: 'Was the doctor on time?', icon: Clock },
                { id: 'communication', title: 'Communication', desc: 'Clear & easy to understand?', icon: User }, // generic icon used
                { id: 'knowledge', title: 'Knowledge', desc: 'Professional expertise', icon: Check },
                { id: 'care', title: 'Care & Empathy', desc: 'Attentive to your concerns?', icon: Smile },
              ].map((aspect) => (
                <div key={aspect.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><aspect.icon size={18} /></div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{aspect.title}</div>
                      <div className="text-xs text-slate-400">{aspect.desc}</div>
                    </div>
                  </div>
                  <RatingStars 
                    size={24} 
                    rating={aspects[aspect.id]} 
                    setRating={(val) => setAspects({...aspects, [aspect.id]: val})} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: What stood out */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <StepCircle num="4" />
              <h2 className="font-bold text-slate-900">What stood out?</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 pl-9">Select all that apply</p>
            <div className="flex flex-wrap gap-2 pl-9">
              {['Very helpful', 'Attentive listener', 'Clear explanation', 'On time', 'Professional', 'Friendly', 'Thorough checkup', 'Would recommend', 'Great experience'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    tags.includes(tag) 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Write Review */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <StepCircle num="5" />
              <h2 className="font-bold text-slate-900">Write a review</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 pl-9">Optional — share your experience in your own words</p>
            
            <div className="pl-9 space-y-6">
              <div className="relative">
                <textarea 
                  rows={4} 
                  value={review} 
                  onChange={(e) => setReview(e.target.value.slice(0, 500))}
                  placeholder="Describe your experience with the doctor, the consultation quality, waiting time, etc..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" 
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium">
                  {review.length}/500
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <ThumbsUp size={20} className="text-slate-400" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Would you recommend this doctor?</div>
                    <div className="text-xs text-slate-500">Help other patients decide</div>
                  </div>
                </div>
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 shrink-0">
                  <button 
                    onClick={() => setRecommend(true)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${recommend === true ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >Yes</button>
                  <button 
                    onClick={() => setRecommend(false)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${recommend === false ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >No</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Submit anonymously</div>
                  <div className="text-xs text-slate-500">Your name won't be visible to the doctor</div>
                </div>
                <button 
                  onClick={() => setAnonymous(!anonymous)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${anonymous ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Submission Area */}
          <div className="mt-8 pt-4 space-y-4">
            {!anonymous && (
              <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                  JD
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Submitting as <span className="text-blue-600">John Doe</span></div>
                  <div className="text-xs text-slate-500">Your review will be visible to other patients</div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <button 
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                <Send size={16} /> Submit Review
              </button>
              <div className="text-xs text-slate-400 mt-3 font-medium">Reviews are moderated and published within 24 hours.</div>
              
              <button 
                onClick={() => navigate('/patient/appointments')}
                className="mt-6 text-sm font-medium text-slate-400 hover:text-slate-600 underline underline-offset-4"
              >
                Skip for now
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
