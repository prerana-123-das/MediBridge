import axiosClient from '../api/axiosClient'

export const paymentService = {
  async createOrder(orderData) {
    const { data } = await axiosClient.post('/payments/create-order', orderData)
    return data
  },
  async processPayment(transactionData) {
    const { data } = await axiosClient.post('/payments/process', transactionData)
    return data
  },
  async getPaymentByAppointment(appointmentId) {
    const { data } = await axiosClient.get(`/payments/appointment/${appointmentId}`)
    return data
  },
  async getAllPayments() {
    const { data } = await axiosClient.get('/payments/all')
    return data
  }
}
