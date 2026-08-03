import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentService } from '../../services/appointmentService'

export const fetchPatientAppointments = createAsyncThunk('appointments/patient', () => appointmentService.getPatientAppointments())
export const fetchDoctorDashboard = createAsyncThunk('appointments/doctorDashboard', () => appointmentService.getDoctorDashboard())
export const cancelAppointment = createAsyncThunk('appointments/cancel', (id) => appointmentService.cancelAppointment(id))
export const fetchAcceptRequest = createAsyncThunk('appointments/accept', async (id) => {
  const response = await appointmentService.respondToRequest(id, 'confirm')
  const data = response?.data || response || {}
  return { id, meetLink: data.meetLink }
})
export const fetchDeclineRequest = createAsyncThunk('appointments/decline', async (id) => {
  await appointmentService.respondToRequest(id, 'decline')
  return id
})
export const fetchDoctorSuggestsNewTime = createAsyncThunk('appointments/suggestNewTime', async (payload) => {
  await appointmentService.rescheduleByDoctor(payload.id, { newDate: payload.newDate, newTime: payload.newTime, reason: payload.reason })
  return payload
})
export const fetchPatientAcceptsSuggestedTime = createAsyncThunk('appointments/patientAccepts', async (id) => {
  const response = await appointmentService.patientRespondToSuggest(id, 'accept')
  const data = response?.data || response || {}
  return { id, meetLink: data.meetLink }
})
export const fetchPatientRejectsSuggestedTime = createAsyncThunk('appointments/patientRejects', async (id) => {
  await appointmentService.patientRespondToSuggest(id, 'reject')
  return id
})
export const reschedulePatientAppointment = createAsyncThunk('appointments/patientReschedule', async (payload) => {
  await appointmentService.patientReschedule(payload.id, { newDate: payload.newDate, newTime: payload.newTime, reason: payload.reason })
  return payload
})
export const updateConsultationPrescription = createAsyncThunk('appointments/updatePrescription', async (payload) => {
  await appointmentService.updatePrescription(payload.id, payload.prescriptions)
  return payload
})
export const completeConsultation = createAsyncThunk('appointments/complete', async (payload) => {
  await appointmentService.completeConsultation(payload.id)
  return payload
})
export const submitBooking = createAsyncThunk('appointments/book', async (payload) => {
  const data = await appointmentService.bookAppointment(payload)
  return data
})
export const rateConsultation = createAsyncThunk('appointments/rate', async (payload) => {
  await appointmentService.rateConsultation(payload.id, payload.score)
  return payload
})

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    patient: { upcoming: [], past: [] },
    doctor: { today: [], pending: [], completed: [], patientRecords: [] },
    patientLoaded: true,
    doctorLoaded: true,
    status: 'idle',
    error: null,
  },
  reducers: {
  },
  extraReducers: (b) => {
    b.addCase(fetchPatientAppointments.pending, (s) => { s.status = 'loading' })
     .addCase(fetchPatientAppointments.fulfilled, (s, { payload }) => { 
       s.status = 'succeeded' 
       const arr = payload.data || payload;
       if (Array.isArray(arr)) {
         s.patient.upcoming = arr.filter(a => {
           return a.status !== 'Completed' && a.status !== 'Cancelled';
         }).map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';
           if (a.appointmentDate) {
               const parts = a.appointmentDate.split('T');
               datePart = parts[0];
               timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';
           }
           return {
             appointment_id: a.appointmentId,
             doctor: a.doctorName || 'Doctor',
             specialization: a.doctorSpecialization || 'Specialist',
             appointment_date: datePart,
             time: timePart,
             status: a.status,
             reason: a.reason,
             rescheduled: a.isRescheduled,
             meetLink: a.meetLink
           }
         })
         s.patient.past = arr.filter(a => {
           return a.status === 'Completed' || a.status === 'Cancelled';
         }).map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';
           if (a.appointmentDate) {
               const parts = a.appointmentDate.split('T');
               datePart = parts[0];
               timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';
           }
           return {
             appointment_id: a.appointmentId,
             doctor: a.doctorName || 'Doctor',
             specialization: a.doctorSpecialization || 'Specialist',
             appointment_date: datePart,
             time: timePart,
             status: a.status,
             reason: a.reason,
             description: a.description,
             attachedFiles: a.attachedFiles || [],
             prescriptions: a.prescriptions || [],
             isRated: a.isRated || false
           }
         })
       }
     })
     .addCase(fetchDoctorDashboard.fulfilled, (s, { payload }) => { 
       s.status = 'succeeded' 
       const arr = payload.data || payload;
       if (Array.isArray(arr)) {
         const patientGroups = {};
         arr.forEach(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';
           if (a.appointmentDate) {
               const parts = a.appointmentDate.split('T');
               datePart = parts[0];
               timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';
           }
           
           const pid = a.patientId || a.patientName;
           if (!patientGroups[pid]) {
             patientGroups[pid] = {
               id: pid,
               name: a.patientName || 'Unknown',
               age: a.patientAge || 0,
               blood_group: a.patientBloodGroup || 'Unknown',
               gender: a.patientGender || 'Unknown',
               last_visit: 'None',
               next: 'None',
               condition: 'N/A',
               reason: 'N/A',
               description: '',
               time: 'N/A',
               files: []
             }
           }
           
           const pr = patientGroups[pid];
           if (a.status === 'Completed') {
             if (pr.last_visit === 'None' || new Date(datePart) > new Date(pr.last_visit)) {
               pr.last_visit = datePart;
               pr.condition = a.description || a.reason || 'Consultation completed';
             }
           } else if (a.status === 'Confirmed' || a.status === 'Pending') {
             if (pr.next === 'None' || new Date(datePart) < new Date(pr.next)) {
               pr.next = datePart;
               pr.time = timePart;
               pr.reason = a.reason || 'N/A';
               pr.description = a.description || '';
             }
           }
           if (a.attachedFiles && a.attachedFiles.length > 0) {
             pr.files = [...new Set([...pr.files, ...a.attachedFiles])];
           }
           // Fallback condition if none completed
           if (pr.condition === 'N/A' && a.reason) {
             pr.condition = a.reason;
           }
         });
         
         s.doctor.patientRecords = Object.values(patientGroups);

         s.doctor.today = arr.filter(a => a.status === 'Confirmed').map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';
           if (a.appointmentDate) {
               const parts = a.appointmentDate.split('T');
               datePart = parts[0];
               timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';
           }
           return {
             id: a.appointmentId,
             name: a.patientName || 'Patient',
             age: a.patientAge || 0,
             date: datePart,
             time: timePart,
             type: a.type || 'Consultation',
             status: a.status,
             reason: a.reason,
             meetLink: a.meetLink
           }
         })
         s.doctor.pending = arr.filter(a => a.status === 'Pending' || a.status === 'Suggested').map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';
           if (a.appointmentDate) {
               const parts = a.appointmentDate.split('T');
               datePart = parts[0];
               timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';
           }
           return {
             id: a.appointmentId,
             name: a.patientName || 'Patient',
             age: a.patientAge || 0,
             date: datePart,
             time: timePart,
             reason: a.reason
           }
         })
         s.doctor.completed = arr.filter(a => a.status === 'Completed').map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';
           if (a.appointmentDate) {
               const parts = a.appointmentDate.split('T');
               datePart = parts[0];
               timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';
           }
           return {
             id: a.appointmentId,
             name: a.patientName || 'Patient',
             age: a.patientAge || 0,
             date: datePart,
             time: timePart,
             diagnosis: a.description || 'Completed',
             prescription: (a.prescriptions && a.prescriptions.length > 0) ? true : false,
             prescriptions: a.prescriptions || []
           }
         })
       }
     })
     .addCase(cancelAppointment.fulfilled, (s, { payload }) => {
       const apptId = payload?.data?.appointmentId || payload?.appointment_id || payload?.id || payload;
       const pAppt = s.patient.upcoming.find((a) => a.appointment_id === apptId)
       if (pAppt) pAppt.status = 'Cancelled'
       
       s.doctor.today = s.doctor.today.filter(t => t.id !== apptId)
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== apptId)
     })
     .addCase(fetchAcceptRequest.fulfilled, (s, { payload }) => {
       const apptId = payload.appointmentId || payload.id || payload;
       const meetLink = payload.meetLink;
       const pAppt = s.doctor.pending.find(p => p.id === apptId)
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== apptId)
       if (pAppt) {
         pAppt.status = 'Confirmed'
         if (meetLink) pAppt.meetLink = meetLink;
         s.doctor.today.push(pAppt)
         s.doctor.today.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
       }
       const patientAppt = s.patient.upcoming.find(a => a.appointment_id === apptId)
       if (patientAppt) {
         patientAppt.status = 'Confirmed'
         if (meetLink) patientAppt.meetLink = meetLink;
       }
     })
     .addCase(fetchDeclineRequest.fulfilled, (s, { payload }) => {
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== payload)
       const patientAppt = s.patient.upcoming.find(a => a.appointment_id === payload)
       if (patientAppt) patientAppt.status = 'Cancelled'
     })
     .addCase(fetchDoctorSuggestsNewTime.fulfilled, (s, { payload }) => {
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== payload.id);
       const patientAppt = s.patient.upcoming.find(a => a.appointment_id === payload.id);
       if (patientAppt) {
         patientAppt.status = 'Suggested'
         patientAppt.appointment_date = payload.newDate
         patientAppt.time = payload.newTime
         patientAppt.reason = payload.reason
       }
     })
     .addCase(fetchPatientAcceptsSuggestedTime.fulfilled, (s, { payload }) => {
       const apptId = payload.appointmentId || payload.id || payload;
       const meetLink = payload.meetLink;
       const appt = s.patient.upcoming.find(a => a.appointment_id === apptId);
       if (appt) {
         appt.status = 'Confirmed';
         if (meetLink) appt.meetLink = meetLink;
         s.doctor.today.push({
           id: appt.appointment_id,
           name: appt.patientName || appt.doctor || 'Unknown Patient',
           age: appt.patientAge || 30,
           time: appt.time,
           type: 'Consultation',
           status: 'Confirmed',
           meetLink: meetLink
         });
         s.doctor.today.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
       }
     })
     .addCase(fetchPatientRejectsSuggestedTime.fulfilled, (s, { payload }) => {
       const appt = s.patient.upcoming.find(a => a.appointment_id === payload);
       if (appt) appt.status = 'Cancelled'
     })
     .addCase(reschedulePatientAppointment.fulfilled, (s, { payload }) => {
       const appt = s.patient.upcoming.find(a => a.appointment_id === payload.id)
       if (appt) {
         appt.appointment_date = payload.newDate
         appt.time = payload.newTime
         appt.status = 'Pending'
         appt.rescheduled = true
       }
       s.doctor.today = s.doctor.today.filter(t => t.id !== payload.id)
       s.doctor.pending.push({
         id: payload.id,
         name: appt?.doctor || 'Patient',
         age: 30,
         date: payload.newDate,
         time: payload.newTime,
         reason: payload.reason || 'Patient requested reschedule'
       })
     })
     .addCase(updateConsultationPrescription.fulfilled, (s, { payload }) => {
       const cons = s.doctor.completed.find(c => c.id === payload.id)
       if (cons) {
         cons.prescription = payload.prescriptions.length > 0
         cons.prescriptions = payload.prescriptions
       }
     })
     .addCase(completeConsultation.fulfilled, (s, { payload }) => {
       s.doctor.today = s.doctor.today.filter(t => t.id !== payload.id)
       s.doctor.completed.unshift({
         id: payload.id, // Keep the same ID for actual appointment tracking
         name: payload.name,
         age: payload.age,
         time: payload.time,
         diagnosis: 'Consultation Completed',
         prescription: false,
         prescriptions: []
       })
       // Also update patient state if loaded
       const pApptUpcoming = s.patient.upcoming.find(a => a.appointment_id === payload.id)
       if (pApptUpcoming) {
         pApptUpcoming.status = 'Completed'
         s.patient.upcoming = s.patient.upcoming.filter(a => a.appointment_id !== payload.id)
         s.patient.past.unshift(pApptUpcoming)
       }
     })
     .addCase(rateConsultation.fulfilled, (s, { payload }) => {
       const appt = s.patient.past.find(a => a.appointment_id === payload.id)
       if (appt) {
         appt.isRated = true
       }
     })
  },
})

// override the cancel action for mock purposes since it's an async thunk that doesn't actually hit the mock backend right
export const mockCancelAppointment = (id) => (dispatch) => {
  dispatch({ type: 'appointments/cancel/fulfilled', payload: id });
}

// export const { completeConsultation } = appointmentsSlice.actions
export default appointmentsSlice.reducer
