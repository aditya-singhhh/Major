import React, { useEffect, useRef } from 'react';
import { Container, Typography, Button, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 50,
    padding: 20,
    textAlign: 'center',
  },
  iframeContainer: {
    marginTop: 30,
    height: '500px',
    width: '100%',
    border: 'none',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: '2rem',
    marginBottom: '20px',
  },
  subHeading: {
    fontSize: '1.2rem',
    marginBottom: '30px',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
}));

const HomePage = () => {
  const classes = useStyles();
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Check if the iframe is loaded properly, and perform any setup if needed
      console.log('Iframe is loaded');
    }
  }, []);

  return (
    <Container component={Paper} className={classes.container}>
      <Typography variant="h5" className={classes.heading}>
        Welcome to the Health Assistant Portal
      </Typography>
      <Typography variant="body1" className={classes.subHeading}>
        Our chatbot is here to help you with medical inquiries, symptoms, and more. Please interact with the chatbot below for assistance.
      </Typography>

      {/* Chatbot iframe */}
      <div className={classes.iframeContainer}>
        <iframe
          ref={iframeRef}
          src="https://copilotstudio.microsoft.com/environments/Default-87bc3fe4-4286-4a77-a6f9-f9b51da4458f/bots/crb37_medHelp/webchat?_version_=2"
          title="Health Assistant Chatbot"
          width="100%"
          height="100%"
          allow="microphone; camera"
        />
      </div>

      {/* Additional Call to Action Button */}
      <Button className={classes.button} onClick={() => window.location.reload()}>
        Reload Chatbot
      </Button>
    </Container>
  );
};

export default HomePage;
