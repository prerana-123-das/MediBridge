import axiosClient from '../api/axiosClient'

export const recordService = {
  async getRecords() {
    const { data } = await axiosClient.get('/records/reports')
    return data.data
  },
  async uploadRecord(recordData) {
    const { data } = await axiosClient.post('/records/reports', recordData)
    return data.data
  },
  async submitConsultationNote(noteData) {
    const { data } = await axiosClient.post('/records/consultations', noteData)
    return data.data
  },
  async deleteRecord(id) {
    const { data } = await axiosClient.delete(`/records/reports/${id}`)
    return data
  }
}
