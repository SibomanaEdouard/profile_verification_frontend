import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const steps = [
  'LinkedIn Authentication',
  'National ID Verification',
  'Profile Picture Verification',
  'Verification Complete'
];

const VerificationStatus = () => {
  const { user } = useAuth();
  console.log(user)
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await api.get('/verification/status');
      // const { status, details } = response.data;
      const { linkedInVerified, idVerified, pictureVerified, details } = response.data;
      
      setVerificationDetails(details);
      // Calculate active step based on verification progress
      if (linkedInVerified && idVerified && pictureVerified) {
        setActiveStep(3);
      } else if (linkedInVerified && idVerified) {
        setActiveStep(2);
      } else if (linkedInVerified) {
        setActiveStep(1);
      } else {
        setActiveStep(0);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching verification status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Verification Status
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Verification Details
          </Typography>
          
          {verificationDetails && (
            <Box>
              <Typography variant="body1" paragraph>
                Name: {verificationDetails.name}
              </Typography>
              <Typography variant="body1" paragraph>
                Email: {verificationDetails.email}
              </Typography>
              {verificationDetails.nationalId?.verified && (
          <Typography variant="body1" paragraph>
        ID Status: Verified
      </Typography>
    )}
              <Typography variant="body1" color="text.secondary">
                Last Updated: {new Date(verificationDetails.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerificationStatus;