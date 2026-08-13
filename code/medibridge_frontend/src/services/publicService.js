import axiosClient from '../api/axiosClient'

export const publicService = {
  async submitContactForm(contactData) {
    const { data } = await axiosClient.post('/public/contact', contactData)
    return data
  }
}
