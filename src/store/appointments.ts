import { Appointment } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';
const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getAppoitments = createAsyncThunk('getAppoitments', async () => {
  const response = await fetch(`${SERVER_API_ENDPOINT}/appointments`);
  const parsedResponse = await response.json();
  return parseIds(parsedResponse) as Appointment[];
});

export const createAppointment = createAsyncThunk(
  'createAppointment',
  async (data: {
    patientId: number;
    practitionerId: number;
    startDate: Date;
    endDate: Date;
  }) => {
    const response = await fetch(`${SERVER_API_ENDPOINT}/appointments`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const parsedResponse = await response.json();
    return parseIds(parsedResponse);
  },
);

export const updateAppointment = createAsyncThunk(
  'updateAppointment',
  async (data: {
    id: number;
    patientId: number;
    practitionerId: number;
    startDate: Date;
    endDate: Date;
  }) => {
    const response = await fetch(
      `${SERVER_API_ENDPOINT}/appointments?id= ${data.id}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
    const parsedResponse = await response.json();
    return parseIds(parsedResponse);
  },
);

export const removeAppointment = createAsyncThunk(
  'removeAppointment',
  async (data: { id: number }) => {
    const response = await fetch(
      `${SERVER_API_ENDPOINT}/appointments?id= ${data.id}`,
      {
        method: 'DELETE',
      },
    );
    const parsedResponse = await response.json();
    return parseIds(parsedResponse);
  },
);

const appointmentsAdapter = createEntityAdapter<Appointment>({
  sortComparer: (a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
});

export const appointmentsSelectors = appointmentsAdapter.getSelectors();

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: appointmentsAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createAppointment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createAppointment.fulfilled, (state, { payload }) => {
      appointmentsAdapter.addOne(state, payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(createAppointment.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
    builder.addCase(updateAppointment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateAppointment.fulfilled, (state, { payload }) => {
      appointmentsAdapter.updateOne(state, {
        id: payload.id,
        changes: {
          patientId: payload.patientId,
          practitionerId: payload.practitionerId,
          startDate: payload.startDate,
          endDate: payload.endDate,
        },
      });
      state.error = null;
      state.loading = false;
    });
    builder.addCase(updateAppointment.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
    builder.addCase(removeAppointment.fulfilled, (state, { payload }) => {
      appointmentsAdapter.removeOne(state, payload.id);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(removeAppointment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAppoitments.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
    builder.addCase(getAppoitments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAppoitments.fulfilled, (state, { payload }) => {
      appointmentsAdapter.setAll(state, payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(removeAppointment.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});
const { appointmentAdded } = appointmentSlice.actions;

export default appointmentSlice;
