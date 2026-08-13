import axiosClient from '../api/axiosClient'

export const patientService = {
  async getPatientProfile(id) {
    const { data } = await axiosClient.get(`/patients/${id}`)
    return data.data
  },

  async updatePatientProfile(id, profileData) {
    const { data } = await axiosClient.put(`/patients/${id}`, profileData)
    return data.data
  }
}
