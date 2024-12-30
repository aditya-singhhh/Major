import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Grid, Typography, Container, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Phone, PhoneDisabled } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { SocketContext } from '../Context';
import PrescriptionForm from './PrescriptionForm'; // Import PrescriptionForm component

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridContainer: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  container: {
    width: '600px',
    margin: '35px 0',
    padding: 0,
    [theme.breakpoints.down('xs')]: {
      width: '80%',
    },
  },
  margin: {
    marginTop: 20,
  },
  padding: {
    padding: 20,
  },
  paper: {
    padding: '10px 20px',
    border: '2px solid black',
  },
  dialogPaper: {
    maxWidth: '600px', // Adjust the width of the dialog
    margin: 'auto',
  },
}));

const SidebarDoctor = ({ children }) => {
  const { callAccepted, name, setName, callEnded, leaveCall, callUser } = useContext(SocketContext);
  const classes = useStyles();
  const { Id } = useParams();
  const [openPrescriptionForm, setOpenPrescriptionForm] = useState(false); // State to toggle PrescriptionForm modal
  const [patientData, setPatientData] = useState(null); // Store patient data
  const [loading, setLoading] = useState(false); // Loading state for data fetch

  // Fetch patient data when the component loads (using useEffect)
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true); // Start loading
        const response = await axios.get(`https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/data/${Id}`);
        setPatientData(response.data); // Store the fetched data in state
      } catch (err) {
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchPatientData(); // Call the fetch function when the component loads
  }, [Id]);

  const handleHangUp = () => {
    leaveCall();
  };

  const handleSendPrescription = () => {
    setOpenPrescriptionForm(true); // Open the PrescriptionForm modal when clicked
  };

  const handleClosePrescriptionForm = () => {
    setOpenPrescriptionForm(false); // Close the PrescriptionForm modal
  };

  return (
    <Container className={classes.container}>
      <Paper elevation={10} className={classes.paper}>
        <form className={classes.root} noValidate autoComplete="off">
          <Grid container className={classes.gridContainer}>
            <Grid item xs={12} md={6} className={classes.padding}>
              <Typography gutterBottom variant="h6">
                Account Info
              </Typography>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={6} className={classes.padding}>
              {/* Hang Up Button */}
              {callAccepted && !callEnded ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PhoneDisabled fontSize="large" />}
                  fullWidth
                  onClick={handleHangUp} // Hang up the call
                  className={classes.margin}
                >
                  Hang Up
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Phone fontSize="large" />}
                  fullWidth
                  onClick={() => callUser(Id)} // Initiate call to the patient
                  className={classes.margin}
                >
                  Call to Patient
                </Button>
              )}
              {/* Send Prescription Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendPrescription} // Show Prescription Form modal
                className={classes.margin}
                style={{ marginTop: 10 }}
              >
                Send Prescription
              </Button>
            </Grid>
          </Grid>
        </form>
        {children}
      </Paper>

      {/* Prescription Form Modal */}
      <Dialog
        open={openPrescriptionForm}
        onClose={handleClosePrescriptionForm}
        classes={{ paper: classes.dialogPaper }} // Apply custom dialog styling
      >
        <DialogTitle>
          Prescription Form
          <Button onClick={handleClosePrescriptionForm} style={{ float: 'right' }}>X</Button> {/* Close Button */}
        </DialogTitle>
        <DialogContent>
          {/* Show loading spinner while fetching data */}
          {loading ? (
            <Typography>Loading...</Typography> // Show loading state
          ) : (
            <PrescriptionForm patientData={patientData} /> // Pass patient data to PrescriptionForm
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrescriptionForm} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SidebarDoctor;
