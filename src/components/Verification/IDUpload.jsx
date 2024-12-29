import { useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Upload } from 'lucide-react';
import api from '../../services/api';

const IDUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    const formData = new FormData();
    formData.append('nationalId', file);

    setLoading(true);
    try {
      const response = await api.post('/verify/national-id', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ type: 'success', text: 'ID uploaded successfully' });
      console.log(response);
      // Clear the file input after successful upload
      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById('id-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error uploading ID',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Upload National ID
        </Typography>
        {message && (
          <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
            {message.text}
          </Alert>
        )}
        <input
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          id="id-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="id-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<Upload />}
            sx={{ mb: 2 }}
          >
            Select ID File
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selected file: {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload ID'}
        </Button>
      </Box>
    </Container>
  );
};

export default IDUpload;
