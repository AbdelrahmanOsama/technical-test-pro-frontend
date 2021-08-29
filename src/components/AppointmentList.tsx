import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AppointmentForm from './AppointmentForm';
import ConfirmationDialog from './ConfirmationDialog';
import { practitionerSelectors } from 'store/practitioner';
import { patientSelectors } from 'store/patient';
import { removeAppointment } from 'store/appointments';
import { formatDate, formatTime } from '../utils/date';

const useStyles = makeStyles((theme) => ({
  appointment: {
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(0),
    marginLeft: 0,
    marginBottom: theme.spacing(1),
    width: 'max-content',
    display: 'inline-block',
  },
  search: {
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(0),
    marginLeft: 0,
    marginBottom: theme.spacing(1),
    float: 'right',
    border: '1px solid #e0e0e0',
    width: 'max-content',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563eb',
    paddingTop: '5px',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const AppointmentList = (props) => {
  const { appointments } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const practitioners = useSelector((state) =>
    practitionerSelectors(state.practitioner),
  );
  const patients = useSelector((state) => patientSelectors(state.patients));
  const [page, setPage] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const [OldAppointment, setOldAppointment] = React.useState(appointments);
  const [appointmentList, setAppointment] = React.useState(appointments);
  const [showPopup, setPopup] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [rowId, setRowId]: any = React.useState('');
  const [editValue, setEditValue] = React.useState({
    id: rowId,
    practitionerId: '',
    patientId: '',
  });
  const [modalName, setModal] = React.useState('New Appointment');

  useEffect(() => {
    setOldAppointment(appointments);
    setAppointment(appointments);
  }, [appointments]);

  const appointmentSearch = (e: any) => {
    let currentList = [];
    let newList = [];
    if (e.target.value !== '') {
      currentList = OldAppointment;
      newList = currentList.filter((item) => {
        const filter = e.target.value.toLowerCase();
        return (
          item.patientInfo.firstName.toLowerCase().includes(filter) ||
          item.patientInfo.lastName.toLowerCase().includes(filter) ||
          item.practitionerInfo.firstName
            .toLowerCase()
            .toLowerCase()
            .includes(filter) ||
          item.practitionerInfo.lastName.toLowerCase().includes(filter) ||
          String(item.id).includes(filter) ||
          formatDate(item.startDate).includes(filter) ||
          formatTime(item.endDate).includes(filter) ||
          formatTime(item.endDate).includes(filter)
        );
      });
      setAppointment(newList);
    } else {
      newList = OldAppointment;
      setAppointment(newList);
    }
  };

  const handleClosing = () => {
    setPopup(false);
    setModal('New Appointment');
  };

  const handleClosingDelete = () => {
    setShowDelete(false);
  };

  const handleAppointmentDeletion = () => {
    dispatch(
      removeAppointment({
        id: rowId,
      }),
    ).then((data) => {
      if (data.meta.requestStatus === 'fulfilled') {
        setShowDelete(false);
        const newAppointment = appointmentList.filter(
          (item) => item.id !== rowId,
        );
        const OldAppointment = appointments.filter((item) => item.id !== rowId);
        setAppointment(newAppointment);
        setOldAppointment(OldAppointment);
      }
    });
  };

  const EditItem = (id) => {
    const filter = appointments.filter((appointment) => appointment.id === id);
    filter.length > 0
      ? setEditValue({
          id,
          practitionerId: filter[0].practitionerId,
          patientId: filter[0].patientId,
        })
      : null;
    setPopup(true);
    setModal('Edit Appointment');
  };

  const deleteItem = (id) => {
    setShowDelete(true);
    setRowId(id);
  };

  return (
    <div>
      <div className={classes.appointment}>
        <AppointmentForm
          practitioners={practitioners}
          patients={patients}
          showPopup={showPopup}
          handleClosing={handleClosing}
          modalName={modalName}
          editValue={editValue}
        />
      </div>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="Search…"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          onChange={appointmentSearch}
          inputProps={{ 'aria-label': 'search' }}
        />
      </div>

      {appointmentList.length > 0 ? (
        <>
          <Table>
            <TableHead className="bg-blue-500">
              <TableRow>
                <TableCell className="text-white">#</TableCell>
                <TableCell className="text-white">Actions</TableCell>
                <TableCell className="text-white">Patients</TableCell>
                <TableCell className="text-white">Practitioners</TableCell>
                <TableCell className="text-white">Date</TableCell>
                <TableCell className="text-white">From</TableCell>
                <TableCell className="text-white">To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointmentList.map((item) => {
                return (
                  <TableRow key={`row-${item.id}`}>
                    <TableCell style={{ borderLeft: '1px solid #e0e0e0' }}>
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <EditIcon
                        className="mr-2 text-blue-600 cursor-pointer"
                        onClick={() => EditItem(item.id)}
                      />
                      <DeleteIcon
                        className="mr-2 text-red-600 cursor-pointer"
                        onClick={() => deleteItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>{`${item.patientInfo.firstName} ${item.patientInfo.lastName}`}</TableCell>
                    <TableCell>{`${item.practitionerInfo.firstName} ${item.practitionerInfo.lastName}`}</TableCell>
                    <TableCell>{formatDate(item.startDate)}</TableCell>
                    <TableCell>{formatTime(item.startDate)}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #e0e0e0' }}>
                      {formatTime(item.endDate)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      ) : (
        <h3 className="relative top-16">No Data To Display</h3>
      )}
      <ConfirmationDialog
        showDelete={showDelete}
        handleClosingDelete={handleClosingDelete}
        handleAppointmentDeletion={handleAppointmentDeletion}
      />
    </div>
  );
};

export default React.memo(AppointmentList);
