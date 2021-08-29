import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MenuItem,
  InputLabel,
  Select,
  CircularProgress,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FormControl from '@material-ui/core/FormControl';
import { useForm, Controller } from 'react-hook-form';
import { formatTime, formatDate } from '../utils/date';
import { getAvailability, availabilitySelectors } from 'store/availability';
import { createAppointment, updateAppointment } from 'store/appointments';

const AppointmentForm = (props) => {
  const dispatch = useDispatch();
  const {
    practitioners,
    patients,
    showPopup,
    handleClosing,
    modalName,
    editValue,
  } = props;

  const [showModal, setShowModal] = React.useState(showPopup);
  const [practitioner, setPractitioner]: any[] = React.useState(0);
  const [popupName, setName] = React.useState(modalName);
  const [loading, setloading] = React.useState('fulfilled');

  const practitioner_Availability = useSelector((state) =>
    availabilitySelectors.selectAll(state.availability),
  );

  useEffect(() => {
    if (!editValue) {
    } else {
      setValue('practitioner', editValue.practitionerId);
      setValue('patient', editValue.patientId);
      setValue('availability', '');
    }
    setShowModal(showPopup);
    setName(modalName);
  }, [showPopup, modalName]);

  useEffect(() => {
    setloading('');
    practitioner &&
      dispatch(getAvailability(practitioner)).then((data) =>
        data.meta.requestStatus === 'fulfilled'
          ? setInterval(() => {
              setloading('fulfilled');
            }, 1000)
          : setloading(''),
      );
  }, [practitioner]);
  interface IFormValues {
    practitioner: string | number;
    patient: string | number;
    availability: string | number;
  }

  const defaultValues = {
    practitioner: '',
    patient: '',
    availability: '',
  };

  const {
    register,
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues, mode: 'onChange' });

  const handleClose = () => {
    reset({ practitioner: '', patient: '', availability: '' });
    setShowModal(false);
    modalName && modalName === 'Edit Appointment' && handleClosing(false);
    handleClosing(false);
    setName('New Appointment');
    setloading('');
  };

  const onSubmit = (data) => {
    try {
      const { practitioner, patient, availability }: any = data;
      const filterAvaliablity = practitioner_Availability.filter(
        (a) => a.id === availability,
      );

      let startDate: Date;
      let endDate: Date;
      filterAvaliablity &&
        filterAvaliablity.length > 0 &&
        ((startDate = filterAvaliablity[0].startDate),
        (endDate = filterAvaliablity[0].endDate));
      switch (modalName) {
        case 'New Appointment':
          dispatch(
            createAppointment({
              patientId: patient,
              practitionerId: practitioner,
              startDate: startDate,
              endDate: endDate,
            }),
          ).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
              reset({ practitioner: '', patient: '', availability: '' });
              setShowModal(false);
              modalName &&
                modalName === 'Edit Appointment' &&
                handleClosing(false);
              setName('New Appointment');
              setloading('');
            }
          });
          break;
        case 'Edit Appointment':
          dispatch(
            updateAppointment({
              id: editValue.id,
              patientId: patient,
              practitionerId: practitioner,
              startDate: startDate,
              endDate: endDate,
            }),
          ).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
              reset({ practitioner: '', patient: '', availability: '' });
              setShowModal(false);
              modalName &&
                modalName === 'Edit Appointment' &&
                handleClosing(false);
              setName('New Appointment');
              setloading('');
            }
          });
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const subscription = watch((value) => {
      value && setPractitioner(value.practitioner);
      value && value.practitioner && setloading('');
    });
    return () => subscription.unsubscribe();
  }, [watch, loading]);

  return (
    <>
      <button
        className="bg-blue-500 text-white active:bg-pink-600 
                      font-bold uppercase pr-6 pl-4 py-2 rounded 
                      shadow hover:shadow-lg outline-none focus:outline-none 
                      mr-1 mb-1 ease-linear transition-all duration-150 "
        type="button"
        onClick={() => setShowModal(true)}
      >
        <AddIcon className="mx-1" />
        New Appointment
      </button>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">{popupName}</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <form>
                  <div className="relative px-6 pt-4 pb-3 flex-auto">
                    <FormControl variant="outlined" className="w-full">
                      <InputLabel
                        id="practitioner-outlined-label"
                        htmlFor="practitioner"
                      >
                        Practitioners
                      </InputLabel>
                      <Controller
                        render={({ field }) => (
                          <Select
                            {...register('practitioner', {
                              required: 'Please select a practitioner',
                            })}
                            name="patient"
                            labelId="practitioner-outlined-label"
                            id="practitioner-outlined"
                            label="practitioner"
                            {...field}
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {practitioners.map((value) => (
                              <MenuItem
                                key={value.id}
                                value={value.id}
                              >{`${value.firstName} ${value.lastName}`}</MenuItem>
                            ))}
                          </Select>
                        )}
                        control={control}
                        name="practitioner"
                        defaultValue={defaultValues.practitioner}
                      />
                      {errors.practitioner && (
                        <p style={{ color: 'red' }}>
                          {errors.practitioner.message}
                        </p>
                      )}
                    </FormControl>
                  </div>
                  <div className="relative px-6 py-3 pb-3 flex-auto">
                    <FormControl variant="outlined" className="w-full">
                      <InputLabel id="patient-outlined-label" htmlFor="patient">
                        Patients
                      </InputLabel>
                      <Controller
                        render={({ field }) => (
                          <Select
                            {...register('patient', {
                              required: 'Please select a patient',
                            })}
                            name="patient"
                            labelId="patient-outlined-label"
                            id="patient-outlined"
                            label="patient"
                            {...field}
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {patients.map((value) => (
                              <MenuItem
                                key={value.id}
                                value={value.id}
                              >{`${value.firstName} ${value.lastName}`}</MenuItem>
                            ))}
                          </Select>
                        )}
                        control={control}
                        name="patient"
                        defaultValue={defaultValues.patient}
                      />
                      {errors.patient && (
                        <p style={{ color: 'red' }}>{errors.patient.message}</p>
                      )}
                    </FormControl>
                  </div>
                  {practitioner && practitioner_Availability.length > 0 ? (
                    <div className="relative px-6 py-1 pb-4 flex-auto">
                      <FormControl variant="outlined" className="w-full">
                        <InputLabel
                          id="availability-outlined-label"
                          htmlFor="Availability"
                        >
                          Availability
                        </InputLabel>
                        <Controller
                          render={({ field }) => (
                            <Select
                              {...register('availability', {
                                required: 'Please select an available slot',
                              })}
                              name="availability"
                              labelId="availability-outlined-label"
                              id="availability-outlined"
                              label="availability"
                              {...field}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {practitioner_Availability.map((value) => (
                                <MenuItem
                                  key={value.id}
                                  value={value.id}
                                >{`${formatDate(
                                  value.startDate,
                                )} - ${formatTime(value.startDate)}`}</MenuItem>
                              ))}
                            </Select>
                          )}
                          control={control}
                          name="availability"
                          defaultValue={''}
                        />
                        {errors.availability && (
                          <p style={{ color: 'red' }}>
                            {errors.availability.message}
                          </p>
                        )}
                      </FormControl>
                    </div>
                  ) : (
                    <div className="text-center">
                      {practitioner && loading == '' ? (
                        <CircularProgress className="text-blue-600" />
                      ) : null}
                    </div>
                  )}
                </form>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button
                    className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default React.memo(AppointmentForm);
