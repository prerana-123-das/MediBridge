import axiosClient from '../api/axiosClient'

export const appointmentService = {
  async getPatientAppointments() {
    const { data } = await axiosClient.get('/appointments/patient')
    return data
  },
  async bookAppointment(payload) {
    const { data } = await axiosClient.post('/appointments', payload)
    return data
  },
  async cancelAppointment(id) {
    const { data } = await axiosClient.patch(`/appointments/${id}/cancel`)
    return data
  },
  async getDoctorDashboard() {
    const { data } = await axiosClient.get('/appointments/doctor/dashboard')
    return data
  },
  async respondToRequest(id, action) {
    const { data } = await axiosClient.patch(`/appointments/${id}/respond`, { action })
    return data
  },
  async rescheduleByDoctor(id, payload) {
    const { data } = await axiosClient.patch(`/appointments/${id}/reschedule`, payload)
    return data
  },
  async patientRespondToSuggest(id, action) {
    const { data } = await axiosClient.patch(`/appointments/${id}/patient-response`, { action })
    return data
  },
  async patientReschedule(id, payload) {
    const { data } = await axiosClient.patch(`/appointments/${id}/patient-reschedule`, payload)
    return data
  },
  async updatePrescription(id, prescriptions) {
    const { data } = await axiosClient.patch(`/appointments/${id}/prescription`, { prescriptions })
    return data
  },
  async completeConsultation(id) {
    const { data } = await axiosClient.patch(`/appointments/${id}/status?status=Completed`)
    return data
  },
  async rateConsultation(id, score) {
    const { data } = await axiosClient.post(`/appointments/${id}/rate`, { score })
    return data
  },
}
