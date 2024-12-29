import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField, Grid, Typography, Container, Paper, CircularProgress } from '@material-ui/core';
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
}));

const SidebarPatient = ({ children }) => {
  const { me, callAccepted, name, setName, callEnded, leaveCall } = useContext(SocketContext);
  const [emailStatus, setEmailStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State variable for error
  const classes = useStyles();
  const { id } = useParams();

  console.log('Retrieved ID from URL params:', id);

  const recipientEmail = 'khushiparyani14@gmail.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/patients/${id}`);
        const { userName } = response.data; // Assuming userName is the field for the name
        setName(userName || ''); // Update the name state
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch patient data.');
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, setName]);

  // Function to generate PDF
  const generatePDF = async () => {
    const response = await axios.get(`https://w22r28wjhb.execute-api.us-east-1.amazonaws.com/patients/${id}`);
    const { userName, age, gender, phoneNumber, symptoms, height, weight, temp, spo2 } = response.data;
    console.log(response.data);

    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor\'s Prescription / Patient Information', 105, 20, { align: 'center' });
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, 25, 200, 25);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Details:', 10, 35);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${userName}`, 10, 45);
    doc.text(`Age: ${age}`, 10, 55);
    doc.text(`Gender: ${gender}`, 10, 65);
    doc.text(`Phone Number: ${phoneNumber}`, 10, 75);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Health Metrics:', 10, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Height: ${height} cm`, 10, 95);
    doc.text(`Weight: ${weight} kg`, 10, 105);
    doc.text(`Temperature: ${temp} °F`, 10, 115);
    doc.text(`SpO2: ${spo2}%`, 10, 125);

    // Add symptoms section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptoms:', 10, 155);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (Array.isArray(symptoms) && symptoms.length > 0) {
      symptoms.forEach((symptom, index) => {
        doc.text(`${index + 1}. ${symptom}`, 20, 165 + index * 10);
      });
    } else {
      doc.text('Symptoms: Not Available', 10, 165);
    }

    return doc.output('blob');
  };

  const sendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const pdfBlob = await generatePDF();

      const pdfFile = new Blob([pdfBlob], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('email', recipientEmail);
      formData.append('uniqueId', me || 'test-id');
      formData.append('file', pdfFile, 'PatientInformation.pdf');

      const response = await axios.post('http://localhost:5000/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response.data);
      setEmailStatus('Email sent successfully!');
    } catch (err) { // Rename variable to avoid shadowing
      setError('Failed to send email with PDF.');
      console.error('Error sending email:', err);
    } finally {
      setLoading(false);
    }
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
            </Grid>
          </Grid>
        </form>
        {children}
      </Paper>
    </Container>
  );
};

export default SidebarPatient;
