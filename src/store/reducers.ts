import timeslots from './timeslots';
import practitioner from './practitioner';
import patients from './patient';
import availability from './availability';
import appointments from './appointments';

export default {
  timeslots: timeslots.reducer,
  practitioner: practitioner.reducer,
  patients: patients.reducer,
  availability: availability.reducer,
  appointments: appointments.reducer,
};
