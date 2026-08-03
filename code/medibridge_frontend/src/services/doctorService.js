import axiosClient from '../api/axiosClient'

export const doctorService = {
  async getDoctors() {
    const { data } = await axiosClient.get('/doctors')
    return data.data
  },
  async getSpecialties() {
    const { data } = await axiosClient.get('/doctors/specialties')
    return data.data
  },
  async getSpecializations() {
    const { data } = await axiosClient.get('/doctors/specializations')
    return data.data
  },
  async getAvailableSlots(doctorId, date) {
    const { data } = await axiosClient.get(`/doctors/${doctorId}/slots`, { params: { date } })
    return data.data
  },
  async getDoctorProfile(id) {
    const { data } = await axiosClient.get(`/doctors/${id}`)
    return data.data
  },
  async updateDoctorProfile(profileData) {
    const { data } = await axiosClient.put('/doctors/profile', profileData)
    return data.data
  },
  async getDoctorAvailability(id) {
    const { data } = await axiosClient.get(`/doctors/${id}/availability`)
    return data.data
  },
  async updateDoctorAvailability(availabilityList) {
    const { data } = await axiosClient.put('/doctors/availability', availabilityList)
    return data.data
  }
}
