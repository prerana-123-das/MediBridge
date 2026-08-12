import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ShieldCheck, Calendar, Clock } from 'lucide-react'
import DashboardTopbar from '../../components/layout/DashboardTopbar'
import { useDispatch, useSelector } from 'react-redux'
import { submitBooking } from '../../features/appointments/appointmentsSlice'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(s => s.auth.user) // Get logged in user details
  const [method, setMethod] = useState('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const doctor = state?.doctor || { fullName: 'Dr. Sarah Johnson', specialization: 'Cardiologist', consultationFee: 150 }
  const fee = doctor.consultationFee || 150
  const platformFee = 5
  const total = fee + platformFee

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return new Date().toISOString();
    const [year, month, day] = dateStr.split('-').map(Number);
    const match = timeStr.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return new Date().toISOString();
    
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const pad = (n) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;
  }

  const pay = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }
      
      // 1. Complete booking logic FIRST to get real appointmentId
      const newAppt = await dispatch(submitBooking({
        doctorId: String(doctor.doctorId),
        appointmentDate: formatDateTime(state?.date, state?.slot),
        reason: state?.subject || 'Consultation',
        description: state?.description || '',
        attachedFiles: state?.attachedFiles || []
      })).unwrap();

      let realApptId = newAppt?.appointmentId || newAppt?.id || newAppt?.data?.appointmentId || newAppt?.data?.data?.appointmentId;
      
      if (!realApptId) {
        // Fallback: fetch latest appointments to guarantee we find the newly created one
        try {
          const allApptsResp = await fetch('http://localhost:8080/api/v1/appointments/patient', {
            headers: { 'Authorization': `Bearer ${user?.token || sessionStorage.getItem('mb_token')}` }
          });
          const apptsJson = await allApptsResp.json();
          const arr = apptsJson.data || [];
          if (arr.length > 0) {
             const maxAppt = arr.reduce((prev, current) => (prev.appointmentId > current.appointmentId) ? prev : current);
             realApptId = maxAppt.appointmentId;
          }
        } catch(e) {
          console.error("Fallback ID extraction failed:", e);
        }
      }

      if (!realApptId) {
        alert("Failed to confirm booking ID. Please check your appointments.");
        setIsProcessing(false);
        return;
      }
      
      // 2. Create order
      const orderResponse = await fetch('http://localhost:8080/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, appointmentId: realApptId })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        alert('Server error. Are you online?');
        setIsProcessing(false);
        return;
      }
      
      const options = {
        key: 'rzp_test_TL21Ol3brhDGZW',
        amount: total * 100,
        currency: 'INR',
        name: 'MediBridge Healthcare',
        description: 'Appointment Consultation Fee',
        order_id: orderData.data.orderId,
        handler: async function (response) {
          try {
            // 3. Process payment on our server using realApptId
            const verifyResponse = await fetch('http://localhost:8080/api/v1/payments/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appointmentId: realApptId,
                amount: total,
                paymentMethod: 'Razorpay',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                patientName: user?.name || user?.fullName || 'Patient Name', 
                patientEmail: user?.email || 'patient@example.com',
                doctorName: doctor.fullName
              })
            });
            
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              navigate('/patient/appointments')
            } else {
              alert('Payment Verification Failed!');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error(err);
            alert('Failed to process payment details.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: 'Patient Name',
          email: 'patient@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2563EB'
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      paymentObject.on('payment.failed', function (response) {
        alert(response.error.description);
        setIsProcessing(false);
      });
      
    } catch (err) {
      console.error('Booking failed:', err)
      alert('Failed to initialize payment. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <DashboardTopbar />
      
      <div className="container py-5" style={{ maxWidth: '1000px' }}>
        <h1 className="fw-bolder m-0" style={{ color: '#0f172a', fontSize: '2rem' }}>Checkout</h1>
        <p className="mt-1 mb-4 pb-2" style={{ color: '#64748b' }}>Complete payment to confirm your appointment</p>

        <div className="row g-4">
          {/* Summary Column */}
          <div className="col-12 col-lg-5">
            <div 
              className="rounded-4 p-4 text-white shadow-sm mb-3" 
              style={{ background: 'linear-gradient(to bottom right, #3b82f6, #4338ca)' }}
            >
              <div className="fw-semibold small mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>MediBridge Booking</div>
              <h2 className="fw-bold h5 m-0">{doctor.fullName}</h2>
              <div className="small mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{doctor.specialization}</div>
              
              <div className="d-flex flex-column gap-2 mb-4 pb-2 small fw-medium" style={{ color: 'rgba(255,255,255,0.95)' }}>
                <div className="d-flex align-items-center gap-2"><Calendar size={16} /> {state?.date || '2026-07-31'}</div>
                <div className="d-flex align-items-center gap-2"><Clock size={16} /> {state?.slot || '09:30 AM'}</div>
              </div>
              
              <div className="border-top pt-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div className="fw-bolder" style={{ fontSize: '2.5rem', lineHeight: 1 }}>${total}.00</div>
              </div>
            </div>

            <div className="card border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#fff' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ color: '#16a34a' }}>
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div className="small fw-medium" style={{ color: '#64748b' }}>
                  Payments are encrypted and processed securely.
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="col-12 col-lg-7">
            <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
              <h3 className="fw-bold mb-4" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Payment Method</h3>
              
              <div className="d-flex gap-3 mb-4">
                <button 
                  type="button"
                  onClick={() => setMethod('razorpay')}
                  className="btn flex-fill fw-semibold rounded-3 py-2"
                  style={{ 
                    border: '1px solid #2563EB',
                    backgroundColor: '#eff6ff',
                    color: '#2563EB',
                    fontSize: '0.9rem'
                  }}
                >
                  Pay with Razorpay
                </button>
              </div>

              <form onSubmit={pay} className="d-flex flex-column gap-3">
                
                <div className="rounded-3 p-4 mt-3" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="d-flex justify-content-between mb-2 small fw-medium" style={{ color: '#64748b' }}>
                    <span>Consultation Fee</span>
                    <span>${fee}.00</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3 small fw-medium" style={{ color: '#64748b' }}>
                    <span>Platform Fee</span>
                    <span>${platformFee}.00</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-3 fw-bold" style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>
                    <span>Total</span>
                    <span>${total}.00</span>
                  </div>
                </div>

                <button type="submit" disabled={isProcessing} className="btn fw-bold text-white rounded-3 py-2 mt-2 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: isProcessing ? '#94a3b8' : '#2563EB', border: 'none' }}>
                  <Lock size={16} /> {isProcessing ? 'Processing...' : 'Pay & Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
