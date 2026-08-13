import axiosClient from '../api/axiosClient'

export const ratingService = {
  async submitRating(ratingData) {
    const { data } = await axiosClient.post('/ratings', ratingData)
    return data
  },
  async getDoctorRatings(doctorId) {
    const { data } = await axiosClient.get(`/ratings/doctor/${doctorId}`)
    return data
  }
}
