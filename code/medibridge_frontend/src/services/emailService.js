import axiosClient from '../api/axiosClient'

export const emailService = {
  async sendEmail(emailData) {
    const { data } = await axiosClient.post('/email/send', emailData)
    return data
  },
  async sendWelcomeEmail(welcomeData) {
    const { data } = await axiosClient.post('/email/welcome', welcomeData)
    return data
  },
  async sendForgotPasswordEmail(forgotPasswordData) {
    const { data } = await axiosClient.post('/email/forgot-password', forgotPasswordData)
    return data
  },
  async getEmailLogs() {
    const { data } = await axiosClient.get('/email/logs')
    return data
  }
}
