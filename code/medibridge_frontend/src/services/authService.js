import axiosClient from '../api/axiosClient'

// Returns { token, user } where user = { id, name, email, role }
export const authService = {
  async login({ email, password, role }) {
    const { data } = await axiosClient.post('/auth/login', { email, password, role })
    return data.data
  },

  async registerPatient(payload) {
    const { data } = await axiosClient.post('/auth/register/patient', payload)
    return data.data
  },

  async registerDoctor(payload) {
    const { data } = await axiosClient.post('/auth/register/doctor', payload)
    return data.data
  },
}
