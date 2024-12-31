import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField, Grid, Typography, Container, Paper, CircularProgress, Modal } from '@material-ui/core';
import { Phone, PhoneDisabled } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import jsPDF from 'jspdf';

import { SocketContext } from '../Context';

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
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
  },
}));

const SidebarPatient = ({ children }) => {
  const { me, callAccepted, name, setName, callEnded, leaveCall } = useContext(SocketContext);
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [pdfLink, setPdfLink] = useState(null);
  const classes = useStyles();
  const { id } = useParams();

  const recipientEmail = 'khushiparyani14@gmail.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/patients/${id}`);
        const { userName, phoneNumber } = response.data;
        setName(userName || '');
        setMobileNumber(phoneNumber || '');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch patient data.');
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, setName]);

  const saveToDynamoDB = async () => {
    try {
      await axios.post('https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/patients', {
        id: me,
        phoneNumber: mobileNumber,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Data saved to DynamoDB successfully.');
    } catch (err) {
      console.error('Error saving to DynamoDB:', err);
      setError('Failed to save data to DynamoDB.');
    }
  };

  const generatePDF = async () => {
    try {
      const response = await axios.get(`https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/patients/${id}`);
      const { userName, age, gender, phoneNumber, symptoms, height, weight, temp, bpm } = response.data;
      // eslint-disable-next-line new-cap
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor\'s Prescription / Patient Information', 105, 20, { align: 'center' });
      doc.line(10, 25, 200, 25);

      doc.setFontSize(14).text('Patient Details:', 10, 35);
      doc.setFontSize(12).setFont('helvetica', 'normal');
      doc.text(`Name: ${userName}`, 10, 45);
      doc.text(`Age: ${age}`, 10, 55);
      doc.text(`Gender: ${gender}`, 10, 65);
      doc.text(`Phone Number: ${phoneNumber}`, 10, 75);

      doc.setFontSize(14).text('Health Metrics:', 10, 85);
      doc.setFontSize(12);
      doc.text(`Height: ${height} cm`, 10, 95);
      doc.text(`Weight: ${weight} kg`, 10, 105);
      doc.text(`Temperature: ${temp} °F`, 10, 115);
      doc.text(`BPM: ${bpm}`, 10, 125);
      doc.text(`Symptoms: ${symptoms}`, 10, 135);

      return doc.output('blob');
    } catch (err) {
      console.error('Error generating PDF:', err);
      throw new Error('Failed to generate PDF');
    }
  };

  const sendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      await saveToDynamoDB();
      const pdfBlob = await generatePDF();
      const pdfFile = new Blob([pdfBlob], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('email', recipientEmail);
      formData.append('uniqueId', me || 'test-id');
      formData.append('file', pdfFile, 'PatientInformation.pdf');

      await axios.post('https://major-4n7q.onrender.com/send-email', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEmailStatus('Email sent successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email with PDF.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch prescription link on button click
  const fetchPrescriptionLink = async () => {
    try {
      const response = await axios.get(`https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/patients/${id}`);
      const { prescriptionUrl } = response.data;
      setPdfLink(prescriptionUrl || null); // Set the prescription link from API response
    } catch (err) {
      console.error('Error fetching prescription link:', err);
      setError('Failed to fetch prescription link.');
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    fetchPrescriptionLink(); // Fetch the prescription link when the modal is opened
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setPdfLink(null); // Clear the link when closing the modal
  };

  return (
    <Container className={classes.container}>
      <Paper elevation={10} className={classes.paper}>
        <form className={classes.root} noValidate autoComplete="off">
          <Grid container className={classes.gridContainer}>
            <Grid item xs={12} md={6} className={classes.padding}>
              <Typography gutterBottom variant="h6">Account Info</Typography>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              {callAccepted && !callEnded ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PhoneDisabled fontSize="large" />}
                  fullWidth
                  onClick={leaveCall}
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
                  onClick={sendEmail}
                  className={classes.margin}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Patient Info'}
                </Button>
              )}
              {emailStatus && (
                <Typography
                  variant="body2"
                  style={{
                    marginTop: '10px',
                    color: emailStatus.includes('success') ? 'green' : 'red',
                  }}
                >
                  {emailStatus}
                </Typography>
              )}
              {error && (
                <Typography variant="body2" color="error" style={{ marginTop: '10px' }}>
                  {error}
                </Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleOpenModal}
                className={classes.margin}
              >
                Show Prescription
              </Button>
            </Grid>
          </Grid>
        </form>
        {children}
      </Paper>

      {/* Modal to display PDF */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        className={classes.modal}
      >
        <div className={classes.modalContent}>
          <span onClick={handleCloseModal} className={classes.closeButton}>X</span>
          {pdfLink ? (
            <iframe
              src={pdfLink}
              width="100%"
              height="500px"
              title="Prescription"
            />
          ) : (
            <Typography variant="body2" color="error">
              No prescription available.
            </Typography>
          )}
        </div>
      </Modal>
    </Container>
  );
};

export default SidebarPatient;
