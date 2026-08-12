import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { recordService } from '../../services/recordService'

export const fetchRecords = createAsyncThunk('records/fetch', () => recordService.getRecords())
export const uploadRecordThunk = createAsyncThunk('records/upload', async (recordData) => {
  return await recordService.uploadRecord(recordData)
})

const recordsSlice = createSlice({
  name: 'records',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {
    deleteRecord: (s, { payload }) => { s.list = s.list.filter(r => r.reportId !== payload && r.report_id !== payload) }
  },
  extraReducers: (b) => {
    b.addCase(fetchRecords.pending, (s) => { s.status = 'loading' })
     .addCase(fetchRecords.fulfilled, (s, { payload }) => { s.status = 'succeeded'; s.list = payload })
     .addCase(fetchRecords.rejected, (s, { error }) => { s.status = 'failed'; s.error = error.message })
     .addCase(uploadRecordThunk.fulfilled, (s, { payload }) => {
       s.list.unshift(payload)
     })
  },
})

export const { deleteRecord } = recordsSlice.actions
export default recordsSlice.reducer
