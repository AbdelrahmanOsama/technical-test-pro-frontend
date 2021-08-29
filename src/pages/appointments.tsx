import React, { useState } from 'react';
import AppointmentForm from 'components/AppointmentForm';
import AppointmentList from 'components/AppointmentList';
import { useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useDispatch, useSelector } from 'react-redux';
import { getAppoitments, appointmentsSelectors } from 'store/appointments';
import { getPractitioner, practitionerSelectors } from 'store/practitioner';
import { patientSelectors } from 'store/patient';

const AppointmentsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState('');
  const practitioners = useSelector((state) =>
    practitionerSelectors(state.practitioner),
  );

  const appointments = useSelector((state) =>
    appointmentsSelectors.selectAll(state.appointments),
  );

  const patients = useSelector((state) => patientSelectors(state.patients));

  const practitionerInfo = (practitionerId: number) => {
    return practitioners.find(
      (practitioner) => practitioner.id === practitionerId,
    );
  };

  const patientInfo = (patientId: number) => {
    return patients.find((patient) => patient.id === patientId);
  };

  let newAppointments = [];
  if (appointments.length > 0 && patients.length > 0) {
    newAppointments = appointments.map((item) => ({
      ...item,
      patientInfo: patientInfo(item.patientId),
      practitionerInfo: practitionerInfo(item.practitionerId),
    }));
  }

  useEffect(() => {
    dispatch(getPractitioner());
    dispatch(getAppoitments()).then((data) =>
      data.meta.requestStatus === 'fulfilled'
        ? setInterval(() => {
            setLoading('fulfilled');
          }, 1000)
        : null,
    );
  }, []);

  return (
    <div>
      {loading && loading === 'fulfilled' ? (
        <div className="page">
          {newAppointments && newAppointments.length > 0 ? (
            <AppointmentList appointments={newAppointments} />
          ) : (
            <div className="flex h-screen justify-center items-center">
              <AppointmentForm
                practitioners={practitioners}
                patients={patients}
                modalName="New Appointment"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-screen justify-center items-center">
          <CircularProgress className="flex h-screen justify-center items-center absolute top-0 text-blue-600" />
          <h3 className="text-gray-500">Please wait until page is loaded</h3>
        </div>
      )}
    </div>
  );
};

AppointmentsPage.pageTitle = 'Appointments';
AppointmentsPage.pageSubtitle = "Let's get to work 👩‍💻";

export default AppointmentsPage;
