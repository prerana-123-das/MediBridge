import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentService } from '../../services/appointmentService'

// Fetches all appointments related to the logged-in patient
export const fetchPatientAppointments = createAsyncThunk('appointments/patient', () => appointmentService.getPatientAppointments())

// Gets the appointments and patient information needed for the doctor's dashboard
export const fetchDoctorDashboard = createAsyncThunk('appointments/doctorDashboard', () => appointmentService.getDoctorDashboard())

// Cancels an existing appointment using its id
export const cancelAppointment = createAsyncThunk('appointments/cancel', (id) => appointmentService.cancelAppointment(id))

// Accepts a doctor's appointment request and keeps the meeting link from the response
export const fetchAcceptRequest = createAsyncThunk('appointments/accept', async (id) => {
  const response = await appointmentService.respondToRequest(id, 'confirm')
  const data = response?.data || response || {}
  return { id, meetLink: data.meetLink }
})

// Declines the appointment request and returns the appointment id
export const fetchDeclineRequest = createAsyncThunk('appointments/decline', async (id) => {
  await appointmentService.respondToRequest(id, 'decline')
  return id
})

// Sends a new date and time suggested by the doctor
export const fetchDoctorSuggestsNewTime = createAsyncThunk('appointments/suggestNewTime', async (payload) => {
  await appointmentService.rescheduleByDoctor(payload.id, { newDate: payload.newDate, newTime: payload.newTime, reason: payload.reason })
  return payload
})

// Lets the patient accept the new time suggested by the doctor
export const fetchPatientAcceptsSuggestedTime = createAsyncThunk('appointments/patientAccepts', async (id) => {
  const response = await appointmentService.patientRespondToSuggest(id, 'accept')
  const data = response?.data || response || {}
  return { id, meetLink: data.meetLink }
})

// Lets the patient reject the suggested appointment time
export const fetchPatientRejectsSuggestedTime = createAsyncThunk('appointments/patientRejects', async (id) => {
  await appointmentService.patientRespondToSuggest(id, 'reject')
  return id
})

// Handles a reschedule request made by the patient
export const reschedulePatientAppointment = createAsyncThunk('appointments/patientReschedule', async (payload) => {
  await appointmentService.patientReschedule(payload.id, { newDate: payload.newDate, newTime: payload.newTime, reason: payload.reason })
  return payload
})

// Updates the prescription details after a consultation
export const updateConsultationPrescription = createAsyncThunk('appointments/updatePrescription', async (payload) => {
  await appointmentService.updatePrescription(payload.id, payload.prescriptions)
  return payload
})

// Marks the consultation as completed
export const completeConsultation = createAsyncThunk('appointments/complete', async (payload) => {
  await appointmentService.completeConsultation(payload.id)
  return payload
})

// Creates a new appointment from the booking details
export const submitBooking = createAsyncThunk('appointments/book', async (payload) => {
  const data = await appointmentService.bookAppointment(payload)
  return data
})

// Submits the patient's rating for a completed consultation
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
    // Updates the patient appointment lists after the API request succeeds
    b.addCase(fetchPatientAppointments.pending, (s) => { s.status = 'loading' })
     .addCase(fetchPatientAppointments.fulfilled, (s, { payload }) => { 
       s.status = 'succeeded' 
       const arr = payload.data || payload;
       if (Array.isArray(arr)) {
         // Upcoming appointments are everything that is not completed or cancelled
         s.patient.upcoming = arr.filter(a => {
           return a.status !== 'Completed' && a.status !== 'Cancelled';
         }).map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';

           // Split the API date-time value so the UI can display date and time separately
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

         // Completed and cancelled appointments are shown in the patient's history
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
     // Converts the doctor's dashboard response into data that can be used by the UI
     .addCase(fetchDoctorDashboard.fulfilled, (s, { payload }) => { 
       s.status = 'succeeded' 
       const arr = payload.data || payload;
       if (Array.isArray(arr)) {
         const patientGroups = {};

         // Group appointments by patient so each patient appears only once in the dashboard
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

           // Check the patient's completed appointments to find the most recent visit
           if (a.status === 'Completed') {
             if (pr.last_visit === 'None' || new Date(datePart) > new Date(pr.last_visit)) {
               pr.last_visit = datePart;
               pr.condition = a.description || a.reason || 'Consultation completed';
             }
           } else if (a.status === 'Confirmed' || a.status === 'Pending') {
             // Keep the earliest upcoming appointment for the patient
             if (pr.next === 'None' || new Date(datePart) < new Date(pr.next)) {
               pr.next = datePart;
               pr.time = timePart;
               pr.reason = a.reason || 'N/A';
               pr.description = a.description || '';
             }
           }

           // Add all attached files while avoiding duplicate file entries
           if (a.attachedFiles && a.attachedFiles.length > 0) {
             pr.files = [...new Set([...pr.files, ...a.attachedFiles])];
           }

           // Fallback condition if none completed
           if (pr.condition === 'N/A' && a.reason) {
             pr.condition = a.reason;
           }
         });
         
         // Convert the grouped patient object into an array for the Redux state
         s.doctor.patientRecords = Object.values(patientGroups);

         // Prepare the list of confirmed appointments for today's doctor dashboard
         s.doctor.today = arr.filter(a => a.status === 'Confirmed').map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';

           // Extract date and time from the appointment date
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

         // Keep pending and suggested appointments separately for the doctor
         s.doctor.pending = arr.filter(a => a.status === 'Pending' || a.status === 'Suggested').map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';

           // Convert the backend appointment timestamp into date and time
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

         // Store completed consultations so the doctor can view the history
         s.doctor.completed = arr.filter(a => a.status === 'Completed').map(a => {
           let datePart = 'N/A';
           let timePart = 'N/A';

           // Extract the consultation date and time for display
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

     // Remove the cancelled appointment from the active patient and doctor lists
     .addCase(cancelAppointment.fulfilled, (s, { payload }) => {
       const apptId = payload?.data?.appointmentId || payload?.appointment_id || payload?.id || payload;
       const pAppt = s.patient.upcoming.find((a) => a.appointment_id === apptId)
       if (pAppt) pAppt.status = 'Cancelled'
       
       s.doctor.today = s.doctor.today.filter(t => t.id !== apptId)
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== apptId)
     })

     // Move an accepted request from pending appointments to confirmed appointments
     .addCase(fetchAcceptRequest.fulfilled, (s, { payload }) => {
       const apptId = payload.appointmentId || payload.id || payload;
       const meetLink = payload.meetLink;
       const pAppt = s.doctor.pending.find(p => p.id === apptId)
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== apptId)

       // Update the appointment status and add the meeting link if one is returned
       if (pAppt) {
         pAppt.status = 'Confirmed'
         if (meetLink) pAppt.meetLink = meetLink;
         s.doctor.today.push(pAppt)
         s.doctor.today.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
       }

       // Keep the patient's appointment status synchronized with the doctor's view
       const patientAppt = s.patient.upcoming.find(a => a.appointment_id === apptId)
       if (patientAppt) {
         patientAppt.status = 'Confirmed'
         if (meetLink) patientAppt.meetLink = meetLink;
       }
     })

     // Remove the declined request from the doctor's pending list
     .addCase(fetchDeclineRequest.fulfilled, (s, { payload }) => {
       s.doctor.pending = s.doctor.pending.filter(p => p.id !== payload)
       const patientAppt = s.patient.upcoming.find(a => a.appointment_id === payload)
       if (patientAppt) patientAppt.status = 'Cancelled'
     })

     // Update both doctor and patient appointment details when the doctor suggests a new time
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

     // Accept the doctor's suggested time and move the appointment back to confirmed status
     .addCase(fetchPatientAcceptsSuggestedTime.fulfilled, (s, { payload }) => {
       const apptId = payload.appointmentId || payload.id || payload;
       const meetLink = payload.meetLink;
       const appt = s.patient.upcoming.find(a => a.appointment_id === apptId);
       if (appt) {
         appt.status = 'Confirmed';
         if (meetLink) appt.meetLink = meetLink;

         // Add the accepted appointment to the doctor's confirmed appointments
         s.doctor.today.push({
           id: appt.appointment_id,
           name: appt.patientName || appt.doctor || 'Unknown Patient',
           age: appt.patientAge || 30,
           time: appt.time,
           type: 'Consultation',
           status: 'Confirmed',
           meetLink: meetLink
         });

         // Keep confirmed appointments ordered by time
         s.doctor.today.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
       }
     })

     // Mark the appointment as cancelled when the patient rejects the suggested time
     .addCase(fetchPatientRejectsSuggestedTime.fulfilled, (s, { payload }) => {
       const appt = s.patient.upcoming.find(a => a.appointment_id === payload);
       if (appt) appt.status = 'Cancelled'
     })

     // Update the appointment with the patient's requested new date and time
     .addCase(reschedulePatientAppointment.fulfilled, (s, { payload }) => {
       const appt = s.patient.upcoming.find(a => a.appointment_id === payload.id)
       if (appt) {
         appt.appointment_date = payload.newDate
         appt.time = payload.newTime
         appt.status = 'Pending'
         appt.rescheduled = true
       }

       // Remove the old appointment from today's confirmed list
       s.doctor.today = s.doctor.today.filter(t => t.id !== payload.id)

       // Add the rescheduled appointment back to the doctor's pending list
       s.doctor.pending.push({
         id: payload.id,
         name: appt?.doctor || 'Patient',
         age: 30,
         date: payload.newDate,
         time: payload.newTime,
         reason: payload.reason || 'Patient requested reschedule'
       })
     })

     // Update the prescription information for a completed consultation
     .addCase(updateConsultationPrescription.fulfilled, (s, { payload }) => {
       const cons = s.doctor.completed.find(c => c.id === payload.id)
       if (cons) {
         cons.prescription = payload.prescriptions.length > 0
         cons.prescriptions = payload.prescriptions
       }
     })

     // Move the consultation from today's appointments to the completed history
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

       // Also update the patient's appointment status and move it to past appointments
       // Also update patient state if loaded
       const pApptUpcoming = s.patient.upcoming.find(a => a.appointment_id === payload.id)
       if (pApptUpcoming) {
         pApptUpcoming.status = 'Completed'
         s.patient.upcoming = s.patient.upcoming.filter(a => a.appointment_id !== payload.id)
         s.patient.past.unshift(pApptUpcoming)
       }
     })

     // Mark the completed consultation as rated after the patient submits a rating
     .addCase(rateConsultation.fulfilled, (s, { payload }) => {
       const appt = s.patient.past.find(a => a.appointment_id === payload.id)
       if (appt) {
         appt.isRated = true
       }
     })
  },
})

// Helper used for mock testing so cancellation can update Redux without calling the backend
// override the cancel action for mock purposes since it's an async thunk that doesn't actually hit the mock backend right
export const mockCancelAppointment = (id) => (dispatch) => {
  dispatch({ type: 'appointments/cancel/fulfilled', payload: id });
}

// export const { completeConsultation } = appointmentsSlice.actions
export default appointmentsSlice.reducer