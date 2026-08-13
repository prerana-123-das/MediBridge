import axiosClient from '../api/axiosClient'

export const exportService = {
  async exportPrescription(id) {
    const { data } = await axiosClient.get(`/export/prescription/${id}`, { responseType: 'blob' })
    return data
  },
  async exportPatientHistory(patientId) {
    const { data } = await axiosClient.get(`/export/history/${patientId}`, { responseType: 'blob' })
    return data
  }
}
