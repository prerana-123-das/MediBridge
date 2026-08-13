import axiosClient from '../api/axiosClient'

// ============================================================================
// ADMIN SERVICE
// This acts as the middleman between the frontend Redux store and the backend API.
// Note: If VITE_USE_MOCK=true in the .env file, the axiosClient automatically 
// intercepts these calls and returns fake data instead of hitting a real server!
// ============================================================================

export const adminService = {
  
  // --- Data Fetchers (GET requests) ---
  
  async getDashboard() {
    const { data } = await axiosClient.get('/admin/dashboard')
    return data.data
  },
  async getPatients() {
    const { data } = await axiosClient.get('/admin/patients')
    return data.data
  },
  async getDoctors() {
    const { data } = await axiosClient.get('/admin/doctors')
    return data.data
  },
  async getAppointments() {
    const { data } = await axiosClient.get('/admin/appointments')
    return data.data
  },
  async getAnalytics() {
    const { data } = await axiosClient.get('/admin/analytics')
    return data.data
  },
  async getSystemSettings() {
    const { data } = await axiosClient.get('/admin/settings')
    return data.data
  },
  // --- Data Modifiers (PUT, DELETE, PATCH requests) ---
  
  async updateSystemSettings(settingsData) {
    const { data } = await axiosClient.put('/admin/settings', settingsData)
    return data.data
  },
  
  // Used by the admin to suspend or activate a patient account
  async updatePatientStatus(id, status) {
    const { data } = await axiosClient.put(`/admin/patients/${id}/status`, { status })
    return data.data
  },
  
  // Used by the admin to suspend or activate a doctor account
  async updateDoctorStatus(id, status) {
    const { data } = await axiosClient.put(`/admin/doctors/${id}/status`, { status })
    return data.data
  },
  
  // Permanently removes a scheduled appointment from the system
  async deleteAppointment(id) {
    const { data } = await axiosClient.delete(`/admin/appointments/${id}`)
    return data
  },
  
  // Fetches all the messages submitted through the public "Contact Us" page
  async getContactMessages() {
    const { data } = await axiosClient.get('/admin/contact-messages')
    return data.data
  },
  
  // Marks a specific contact message as "Read" so it stops showing up as new
  async markContactMessageRead(id) {
    const { data } = await axiosClient.patch(`/admin/contact-messages/${id}/read`)
    return data.data
  }
}
