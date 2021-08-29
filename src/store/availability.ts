import { Availability } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getAvailability = createAsyncThunk(
  'getAvailability',
  async (practitionerId: string) => {
    const response = await fetch(
      `${SERVER_API_ENDPOINT}/availabilities?practitionerId= ${practitionerId}`,
    );
    const parsedResponse = await response.json();
    return parseIds(parsedResponse) as Availability[];
  },
);

const availabilityAdapter = createEntityAdapter<Availability>({
  sortComparer: false,
});

export const availabilitySelectors = availabilityAdapter.getSelectors();

const practitionerSlice = createSlice({
  name: 'availabilities',
  initialState: availabilityAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAvailability.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAvailability.fulfilled, (state, action) => {
      availabilityAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getAvailability.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default practitionerSlice;
