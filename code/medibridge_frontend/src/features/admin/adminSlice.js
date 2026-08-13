import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminService } from '../../services/adminService'

// ============================================================================
// ASYNC THUNKS (API CALLS)
// These functions talk to the backend via the adminService and then automatically
// pass the results down into the Redux store so the UI can update.
// ============================================================================

// Data Fetchers
export const fetchAdminDashboard = createAsyncThunk('admin/dashboard', () => adminService.getDashboard())
export const fetchAdminPatients = createAsyncThunk('admin/patients', () => adminService.getPatients())
export const fetchAdminDoctors = createAsyncThunk('admin/doctors', () => adminService.getDoctors())
export const fetchAdminAppointments = createAsyncThunk('admin/appointments', () => adminService.getAppointments())
export const fetchAdminAnalytics = createAsyncThunk('admin/analytics', () => adminService.getAnalytics())
export const fetchAdminContactMessages = createAsyncThunk('admin/contactMessages', () => adminService.getContactMessages())

// Mutations (Actions that change data on the backend)
export const fetchTogglePatientStatus = createAsyncThunk('admin/togglePatientStatus', async ({ id, status }) => {
  return await adminService.updatePatientStatus(id, status)
})
export const fetchToggleDoctorStatus = createAsyncThunk('admin/toggleDoctorStatus', async ({ id, status }) => {
  return await adminService.updateDoctorStatus(id, status)
})
export const fetchDeleteAppointment = createAsyncThunk('admin/deleteAppointment', async (id) => {
  // We return the ID here so the Redux slice knows exactly which appointment to remove from the array
  await adminService.deleteAppointment(id)
  return id
})
export const fetchMarkContactMessageRead = createAsyncThunk('admin/markContactMessageRead', async (id) => {
  return await adminService.markContactMessageRead(id)
})

// ============================================================================
// REDUX SLICE (STATE MANAGEMENT)
// This holds all the global data for the Admin Portal.
// ============================================================================
const adminSlice = createSlice({
  name: 'admin',
  // Default empty state before any data arrives from the backend
  initialState: {
    stats: null, activity: [], patients: [], doctors: [], appointments: [], analytics: null, contactMessages: [],
    status: 'idle',
  },
  reducers: {}, // No regular reducers needed because all state changes are driven by API calls (AsyncThunks)
  extraReducers: (b) => {
    // When the data fetchers succeed, just overwrite the old array with the brand new data
    b.addCase(fetchAdminDashboard.fulfilled, (s, { payload }) => { s.stats = payload.stats; s.activity = payload.activity })
     .addCase(fetchAdminPatients.fulfilled, (s, { payload }) => { s.patients = payload })
     .addCase(fetchAdminDoctors.fulfilled, (s, { payload }) => { s.doctors = payload })
     .addCase(fetchAdminAppointments.fulfilled, (s, { payload }) => { s.appointments = payload })
     .addCase(fetchAdminAnalytics.fulfilled, (s, { payload }) => { s.analytics = payload })
     .addCase(fetchAdminContactMessages.fulfilled, (s, { payload }) => { s.contactMessages = payload })
     
     // For mutations, we carefully find the specific item in the array and update its status 
     // so the UI changes instantly without needing to reload the entire page.
     .addCase(fetchTogglePatientStatus.fulfilled, (s, { payload }) => {
       const index = s.patients.findIndex(p => p.patientId === payload.patientId)
       if (index !== -1) s.patients[index].status = payload.status
     })
     .addCase(fetchToggleDoctorStatus.fulfilled, (s, { payload }) => {
       const index = s.doctors.findIndex(d => d.doctorId === payload.doctorId)
       if (index !== -1) s.doctors[index].status = payload.status
     })
     .addCase(fetchDeleteAppointment.fulfilled, (s, { payload }) => {
       // Filter out the deleted appointment from the array
       s.appointments = s.appointments.filter(a => a.appointmentId !== payload)
     })
     .addCase(fetchMarkContactMessageRead.fulfilled, (s, { payload }) => {
       const index = s.contactMessages.findIndex(m => m.id === payload.id)
       if (index !== -1) s.contactMessages[index] = payload
     })
  },
})
export default adminSlice.reducer
