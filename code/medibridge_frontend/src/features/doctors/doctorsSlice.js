import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { doctorService } from '../../services/doctorService'

export const fetchDoctors = createAsyncThunk('doctors/fetch', () => doctorService.getDoctors())
export const fetchSpecialties = createAsyncThunk('doctors/specialties', () => doctorService.getSpecialties())
export const fetchAvailableSlots = createAsyncThunk('doctors/slots', ({ doctorId, date }) => doctorService.getAvailableSlots(doctorId, date))
export const fetchDoctorAvailability = createAsyncThunk('doctors/availability/fetch', (doctorId) => doctorService.getDoctorAvailability(doctorId))
export const updateDoctorAvailability = createAsyncThunk('doctors/availability/update', (availabilityList) => doctorService.updateDoctorAvailability(availabilityList))

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: { list: [], specialties: [], availability: [], availableSlots: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDoctors.pending, (s) => { s.status = 'loading' })
     .addCase(fetchDoctors.fulfilled, (s, { payload }) => { s.status = 'succeeded'; s.list = payload })
     .addCase(fetchDoctors.rejected, (s, { error }) => { s.status = 'failed'; s.error = error.message })
     .addCase(fetchSpecialties.fulfilled, (s, { payload }) => { s.specialties = payload })
     .addCase(fetchAvailableSlots.fulfilled, (s, { payload }) => { s.availableSlots = payload })
     .addCase(fetchDoctorAvailability.fulfilled, (s, { payload }) => { s.availability = payload })
     .addCase(updateDoctorAvailability.fulfilled, (s, { payload }) => { s.availability = payload })
  },
})
export default doctorsSlice.reducer
