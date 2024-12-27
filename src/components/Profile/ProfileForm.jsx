import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  education: Yup.array().of(
    Yup.object({
      institution: Yup.string().required('Institution is required'),
      degree: Yup.string().required('Degree is required'),
      fieldOfStudy: Yup.string().required('Field of study is required'),
      startDate: Yup.date().required('Start date is required'),
      endDate: Yup.date().min(
        Yup.ref('startDate'),
        'End date must be after start date'
      ),
    })
  ),
  workExperience: Yup.array().of(
    Yup.object({
      company: Yup.string().required('Company is required'),
      position: Yup.string().required('Position is required'),
      startDate: Yup.date().required('Start date is required'),
      endDate: Yup.date().min(
        Yup.ref('startDate'),
        'End date must be after start date'
      ),
    })
  ),
});

const ProfileForm = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      education: [
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
        },
      ],
      workExperience: [
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
        },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await api.put('/api/profile', values);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Error updating profile',
        });
      }
    },
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        name: user.name || '',
        email: user.email || '',
        education: user.education || [
          {
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
          },
        ],
        workExperience: user.workExperience || [
          {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
          },
        ],
      });
    }
  }, [user]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Information
        </Typography>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            {/* Add education fields here */}
            {/* Add work experience fields here */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default ProfileForm;