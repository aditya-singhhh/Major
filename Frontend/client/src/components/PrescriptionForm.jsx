import React, { useState } from 'react';
import { TextField, Button, Container, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AWS from 'aws-sdk';
import { jsPDF } from 'jspdf';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 50,
    padding: 20,
    maxWidth: 600,
  },
  formField: {
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
}));

const PrescriptionForm = ({ patientData }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    userName: patientData[0].userName || '',
    age: patientData[0].age || '',
    gender: patientData[0].gender || '',
    phoneNumber: patientData[0].phoneNumber || '',
    symptoms: patientData[0].symptoms || '',
    height: patientData[0].height || '',
    weight: patientData[0].weight || '',
    temp: patientData[0].temp || '',
    spo2: patientData[0].spo2 || '',
    medications: '',
    advice: '',
    feedback: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    // eslint-disable-next-line new-cap
      const doc = new jsPDF();
      doc.text('Prescription Details', 10, 10);
      Object.keys(formData).forEach((key, index) => {
        doc.text(`${key}: ${formData[key]}`, 10, 20 + index * 10);
      });
      const pdfBlob = doc.output('blob');

      // Configure AWS SDK
      AWS.config.update({
        region: 'us-east-1', // Change to your desired region
        accessKeyId: 'AKIAXZEFIHPDJZ22WC4F', // Replace with your Access Key ID
        secretAccessKey: 'tE5+/M9MDI1YFIKrKt59mIHof7RUaqKQAs3dIPbh', // Replace with your Secret Access Key
      });
      const s3 = new AWS.S3();

      // Upload PDF to S3
      const bucketName = 'prescriptiondsce';
      const fileName = `prescription_${formData.userName}_${Date.now()}.pdf`;
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: pdfBlob,
        ContentType: 'application/pdf',
      };

      const uploadResult = await s3.upload(uploadParams).promise();

      // Save URL to DynamoDB
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      const tableName = 'PatientData';
      const dynamoParams = {
        TableName: tableName,
        Item: {
          phoneNumber: patientData[0].phoneNumber,
          prescriptionUrl: uploadResult.Location,
          timestamp: new Date().toISOString(),
        },
      };

      await dynamoDB.put(dynamoParams).promise();
      alert('Prescription generated and saved successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to generate or save the prescription.');
    }
  };

  return (
    <Container component={Paper} className={classes.container}>
      <Typography variant="h5" gutterBottom>
        Prescription Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="userName"
          label="Patient Name"
          value={formData.userName}
          onChange={handleChange}
          className={classes.formField}
          InputProps={{ readOnly: true }}
        />
        <TextField
          fullWidth
          name="age"
          label="Age"
          value={formData.age}
          onChange={handleChange}
          className={classes.formField}
          InputProps={{ readOnly: true }}
        />
        <TextField
          fullWidth
          name="gender"
          label="Gender"
          value={formData.gender}
          onChange={handleChange}
          className={classes.formField}
          InputProps={{ readOnly: true }}
        />
        <TextField
          fullWidth
          name="phoneNumber"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="symptoms"
          label="Symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="height"
          label="Height"
          value={formData.height}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="weight"
          label="Weight"
          value={formData.weight}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="temp"
          label="Temperature"
          value={formData.temp}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="spo2"
          label="SpO2"
          value={formData.spo2}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="medications"
          label="Medications"
          value={formData.medications}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="advice"
          label="Advice"
          value={formData.advice}
          onChange={handleChange}
          className={classes.formField}
        />
        <TextField
          fullWidth
          name="feedback"
          label="Feedback"
          value={formData.feedback}
          onChange={handleChange}
          className={classes.formField}
        />
        <Button type="submit" variant="contained" color="primary" className={classes.button}>
          Generate & Save Prescription
        </Button>
      </form>
    </Container>
  );
};

export default PrescriptionForm;
