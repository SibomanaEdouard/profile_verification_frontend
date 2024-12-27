// import from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const LinkedInLogin = () => {
  const handleLinkedInLogin = () => {
    // window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/linkedin`;
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in to Mpuza
        </Typography>
        <Button
          variant="contained"
          startIcon={<LinkedInIcon />}
          onClick={handleLinkedInLogin}
          sx={{ mt: 3, mb: 2 }}
        >
          Sign in with LinkedIn
        </Button>
      </Box>
    </Container>
  );
};

export default LinkedInLogin;