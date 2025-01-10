/* eslint-disable react-hooks/exhaustive-deps */
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
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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

// this is to set the initial values 
const getInitialValues = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  education: user?.education?.map(edu => ({
    ...edu,
    startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
    endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''
  })) || [],
  workExperience: user?.workExperience?.map(work => ({
    ...work,
    startDate: work.startDate ? new Date(work.startDate).toISOString().split('T')[0] : '',
    endDate: work.endDate ? new Date(work.endDate).toISOString().split('T')[0] : ''
  })) || [],
});

// this is to format the birth day 
const formatDateOfBirth = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// this is to deal with  the profile form
const ProfileForm = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/profile');
        setUserData(response.data);
        // Reset form with fetched data
        formik.resetForm({
          values: getInitialValues(response.data),
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Error loading profile data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formik = useFormik({
    initialValues: getInitialValues(userData || user),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Format dates before sending
        const formattedValues = {
          ...values,
          education: values.education.map(edu => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate).toISOString() : null,
            endDate: edu.endDate ? new Date(edu.endDate).toISOString() : null,
          })),
          workExperience: values.workExperience.map(work => ({
            ...work,
            startDate: work.startDate ? new Date(work.startDate).toISOString() : null,
            endDate: work.endDate ? new Date(work.endDate).toISOString() : null,
          })),
        };

        await api.put('/profile', formattedValues);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Error updating profile',
        });
      }
    },
  });

  const handleAddEducation = () => {
    const newEducation = [...formik.values.education, {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
    }];
    formik.setFieldValue('education', newEducation);
  };

  const handleAddWorkExperience = () => {
    const newWorkExperience = [...formik.values.workExperience, {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
    }];
    formik.setFieldValue('workExperience', newWorkExperience);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          {/* Name Section */}
          <Grid item xs={12}>
            {!formik.values.name ? (
              <Box sx={{ p: 2, border: '2px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => formik.setFieldValue('name', '')}
                >
                  Add Name
                </Button>
              </Box>
            ) : (
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            )}
          </Grid>

          {/* Email Section */}
          <Grid item xs={12}>
            {!formik.values.email ? (
              <Box sx={{ p: 2, border: '2px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => formik.setFieldValue('email', '')}
                >
                  Add Email
                </Button>
              </Box>
            ) : (
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            )}
          </Grid>
            {/* National ID Section - Only shown if available */}
            {(userData?.nationalId?.idNumber || user?.nationalId?.idNumber) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="National ID"
                  value={userData?.nationalId?.idNumber || user?.nationalId?.idNumber}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#000000",
                      opacity: 0.8,
                    },
                  }}
                />
              </Grid>
            )}

      {/* Date of birth Section - Only shown if available */}
      {(userData?.nationalId?.dateOfBirth || user?.nationalId?.dateOfBirth) && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Date of Birth"
            value={formatDateOfBirth(userData?.nationalId?.dateOfBirth || user?.nationalId?.dateOfBirth)}
            InputProps={{
              readOnly: true,
            }}
            disabled
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#000000",
                opacity: 0.8,
              },
            }}
          />
        </Grid>
      )}

          {/* Education Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Education
            </Typography>
            {formik.values.education.length === 0 ? (
              <Box sx={{ p: 2, border: '2px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddEducation}
                >
                  Add Education
                </Button>
              </Box>
            ) : (
              <>
                {formik.values.education.map((edu, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name={`education.${index}.institution`}
                            label="Institution"
                            value={edu.institution}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.education?.[index]?.institution &&
                              Boolean(formik.errors.education?.[index]?.institution)
                            }
                            helperText={
                              formik.touched.education?.[index]?.institution &&
                              formik.errors.education?.[index]?.institution
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name={`education.${index}.degree`}
                            label="Degree"
                            value={edu.degree}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.education?.[index]?.degree &&
                              Boolean(formik.errors.education?.[index]?.degree)
                            }
                            helperText={
                              formik.touched.education?.[index]?.degree &&
                              formik.errors.education?.[index]?.degree
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name={`education.${index}.fieldOfStudy`}
                            label="Field of Study"
                            value={edu.fieldOfStudy}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.education?.[index]?.fieldOfStudy &&
                              Boolean(formik.errors.education?.[index]?.fieldOfStudy)
                            }
                            helperText={
                              formik.touched.education?.[index]?.fieldOfStudy &&
                              formik.errors.education?.[index]?.fieldOfStudy
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            name={`education.${index}.startDate`}
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={edu.startDate}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.education?.[index]?.startDate &&
                              Boolean(formik.errors.education?.[index]?.startDate)
                            }
                            helperText={
                              formik.touched.education?.[index]?.startDate &&
                              formik.errors.education?.[index]?.startDate
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            name={`education.${index}.endDate`}
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={edu.endDate}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.education?.[index]?.endDate &&
                              Boolean(formik.errors.education?.[index]?.endDate)
                            }
                            helperText={
                              formik.touched.education?.[index]?.endDate &&
                              formik.errors.education?.[index]?.endDate
                            }
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddEducation}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Add Another Education Entry
                </Button>
              </>
            )}
          </Grid>

          {/* Work Experience Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Work Experience
            </Typography>
            {formik.values.workExperience.length === 0 ? (
              <Box sx={{ p: 2, border: '2px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddWorkExperience}
                >
                  Add Work Experience
                </Button>
              </Box>
            ) : (
              <>
                {formik.values.workExperience.map((work, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name={`workExperience.${index}.company`}
                            label="Company"
                            value={work.company}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.workExperience?.[index]?.company &&
                              Boolean(formik.errors.workExperience?.[index]?.company)
                            }
                            helperText={
                              formik.touched.workExperience?.[index]?.company &&
                              formik.errors.workExperience?.[index]?.company
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name={`workExperience.${index}.position`}
                            label="Position"
                            value={work.position}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.workExperience?.[index]?.position &&
                              Boolean(formik.errors.workExperience?.[index]?.position)
                            }
                            helperText={
                              formik.touched.workExperience?.[index]?.position &&
                              formik.errors.workExperience?.[index]?.position
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            name={`workExperience.${index}.startDate`}
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={work.startDate}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.workExperience?.[index]?.startDate &&
                              Boolean(formik.errors.workExperience?.[index]?.startDate)
                            }
                            helperText={
                              formik.touched.workExperience?.[index]?.startDate &&
                              formik.errors.workExperience?.[index]?.startDate
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            name={`workExperience.${index}.endDate`}
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={work.endDate}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.workExperience?.[index]?.endDate &&
                              Boolean(formik.errors.workExperience?.[index]?.endDate)
                            }
                            helperText={
                              formik.touched.workExperience?.[index]?.endDate &&
                              formik.errors.workExperience?.[index]?.endDate
                            }
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddWorkExperience}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Add Another Work Experience Entry
                </Button>
              </>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
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