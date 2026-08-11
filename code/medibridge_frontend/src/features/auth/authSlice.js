import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

const savedUser = (() => {
  try { return JSON.parse(sessionStorage.getItem('mb_user')) || JSON.parse(localStorage.getItem('mb_user')) } catch { return null }
})()

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try { return await authService.login(creds) } catch (e) { return rejectWithValue(e?.response?.data?.message || 'Login failed') }
})

export const registerPatient = createAsyncThunk('auth/registerPatient', async (payload, { rejectWithValue }) => {
  try { return await authService.registerPatient(payload) } catch (e) { return rejectWithValue(e?.response?.data?.message || 'Registration failed') }
})

export const registerDoctor = createAsyncThunk('auth/registerDoctor', async (payload, { rejectWithValue }) => {
  try { return await authService.registerDoctor(payload) } catch (e) { return rejectWithValue(e?.response?.data?.message || 'Registration failed') }
})

const persist = (token, user, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('mb_token', token)
    localStorage.setItem('mb_user', JSON.stringify(user))
    sessionStorage.removeItem('mb_token')
    sessionStorage.removeItem('mb_user')
  } else {
    sessionStorage.setItem('mb_token', token)
    sessionStorage.setItem('mb_user', JSON.stringify(user))
    localStorage.removeItem('mb_token')
    localStorage.removeItem('mb_user')
  }
}

const initialState = {
  user: savedUser || null,
  token: sessionStorage.getItem('mb_token') || localStorage.getItem('mb_token') || null,
  isAuthenticated: !!savedUser,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      sessionStorage.removeItem('mb_token')
      sessionStorage.removeItem('mb_user')
      localStorage.removeItem('mb_token')
      localStorage.removeItem('mb_user')
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      const payload = action.payload;
      const rememberMe = action.meta.arg.rememberMe !== false; // Defaults to true if not explicitly false
      console.log("Redux Login Fulfilled payload:", payload);
      state.status = 'succeeded'
      state.user = payload.user
      state.token = payload.token
      state.isAuthenticated = true
      persist(payload.token, payload.user, rememberMe)
    }
    const pending = (state) => { state.status = 'loading'; state.error = null }
    const rejected = (state, { payload }) => { state.status = 'failed'; state.error = payload }
    builder
      .addCase(login.pending, pending).addCase(login.fulfilled, fulfilled).addCase(login.rejected, rejected)
      .addCase(registerPatient.pending, pending).addCase(registerPatient.fulfilled, fulfilled).addCase(registerPatient.rejected, rejected)
      .addCase(registerDoctor.pending, pending).addCase(registerDoctor.fulfilled, fulfilled).addCase(registerDoctor.rejected, rejected)
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
