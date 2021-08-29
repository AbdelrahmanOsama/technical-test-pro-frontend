import { Patient } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getPatient = createAsyncThunk('getPatient', async () => {
  const response = await fetch(`${SERVER_API_ENDPOINT}/patients`);
  const parsedResponse = await response.json();
  return parseIds(parsedResponse) as Patient[];
});

const patientAdapter = createEntityAdapter<Patient>({
  sortComparer: false,
});

export const {
  selectAll: patientSelectors,
  selectById: patientSelectorsById,
} = patientAdapter.getSelectors();

const patientSlice = createSlice({
  name: 'patients',
  initialState: patientAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPatient.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getPatient.fulfilled, (state, action) => {
      patientAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getPatient.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default patientSlice;
