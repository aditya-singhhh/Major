const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory for quick access
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size (50 MB in this example)
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint to send emails
app.post('/send-email', upload.single('file'), (req, res) => {
  const { email, uniqueId } = req.body;
  const file = req.file; // Access the uploaded file

  if (!file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  // Email content
  const mailOptions = {
    from: 'adityakalyanpur123@gmail.com',
    to: email,
    subject: 'Invitation to Join a Video Consultation Room',
    html: `
      <p>Dear Dr. Khushi,</p>

      <p>We hope this email finds you well.</p>

      <p>You have been invited to join a video consultation with one of your patients. Please use the link below to enter the patient’s room:</p>

      <p><strong>Patient Consultation Link:</strong><br>
      <a href="https://major-1-3kkg.onrender.com//doctor/${uniqueId}">Click here to join the consultation room</a></p>

      <p>If you need any assistance or encounter any issues, please feel free to reach out to us.</p>

      <p>Thank you for your time and dedication. We look forward to your consultation with the patient.</p>

      <p>Thank You</p>
    `,
    attachments: file
      ? [
          {
            filename: file.originalname,
            content: file.buffer,
          },
        ]
      : [],
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send({ message: 'Failed to send email', error });
    }
    console.log('Email sent:', info.response);
    res.status(200).send({ message: 'Email sent successfully!', info });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
