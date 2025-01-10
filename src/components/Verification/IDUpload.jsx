import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
} from '@mui/material';
import { Upload } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../../services/api';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const IDUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (message?.type === 'success') {
      timer = setTimeout(() => {
        navigate('/profile');
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [message, navigate]);

  // Function to convert PDF to image
  const convertPDFToImage = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); 

      const scale = 2; 
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(new File([blob], 'converted-page.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.95);
      });
    } catch (error) {
      console.error('PDF conversion error:', error);
      throw new Error('Failed to convert PDF to image');
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        event.target.value = '';
        return;
      }

      try {
        let fileToUpload = selectedFile;
        
        // Convert PDF to image if necessary
        if (selectedFile.type === 'application/pdf') {
          setLoading(true);
          fileToUpload = await convertPDFToImage(selectedFile);
          setLoading(false);
        }

        setFile(fileToUpload);
        setMessage(null);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error processing file' });
        event.target.value = '';
        setLoading(false);
      }
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
      const { data } = await api.post('/verify/national-id', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({
        type: data.success ? 'success' : 'error',
        text: data.message || 'ID verified successfully!'
      });

      if (data.success) {
        setFile(null);
        document.getElementById('id-upload').value = '';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error uploading ID'
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
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Upload National ID
        </Typography>

        {message && (
          <Alert
            severity={message.type}
            sx={{ width: '100%' }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <input
          accept="image/jpeg,image/png,application/pdf"
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
            disabled={loading}
          >
            Select ID File
          </Button>
        </label>

        {file && (
          <Typography variant="body2" color="textSecondary">
            Selected: {file.name}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload ID'}
        </Button>
      </Box>
    </Container>
  );
};

export default IDUpload;