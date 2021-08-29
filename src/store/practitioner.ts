import { Practitioner } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { getPatient } from 'store/patient';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getPractitioner = createAsyncThunk(
  'getPractitioner',
  async (_, { dispatch }) => {
    const response = await fetch(`${SERVER_API_ENDPOINT}/practitioners`);
    const parsedResponse = await response.json();
    dispatch(getPatient());
    return parseIds(parsedResponse) as Practitioner[];
  },
);

const practitionerAdapter = createEntityAdapter<Practitioner>({
  sortComparer: (a, b) => a.speciality.localeCompare(b.speciality),
});

export const {
  selectAll: practitionerSelectors,
  selectById: practitionerSelectorsByID,
} = practitionerAdapter.getSelectors();

const practitionerSlice = createSlice({
  name: 'practitioners',
  initialState: practitionerAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPractitioner.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getPractitioner.fulfilled, (state, action) => {
      practitionerAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getPractitioner.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default practitionerSlice;
