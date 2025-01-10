import { useState, useEffect } from 'react';
import * as faceDetection from '@tensorflow-models/face-detection';
import {
  Button,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  Grid,
  LinearProgress,
} from '@mui/material';
import { Camera, Upload, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as mpFaceDetection from "@mediapipe/face_detection"


const ProfilePicture = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [similarityDialog, setSimilarityDialog] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [currentPicture, setCurrentPicture] = useState(null);
  const [tempPath, setTempPath] = useState(null);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    
        const faceDetector = await faceDetection.createDetector(model, {
          modelType: "full",
          solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@${mpFaceDetection.VERSION}`,
          runtime: "mediapipe",
          maxFaces: 1
        });
        setDetector(faceDetector);
      } catch (error) {
        console.error('Error initializing face detector:', error);
        setMessage({
          type: 'error',
          text: 'Failed to initialize face detection. Please try again later.'
        });
      }
    };

    initializeDetector();
  }, []);

  useEffect(() => {
    const fetchCurrentPicture = async () => {
      try {
        if (user?.profilePicture) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${user.profilePicture.url}`;
          setCurrentPicture(imageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchCurrentPicture();
  }, [user]);

  const detectFace = async (imageElement) => {
    if (!detector) {
      throw new Error('Face detector not initialized');
    }

    try {
      const faces = await detector.estimateFaces(imageElement);
      return faces.length > 0;
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw new Error('Failed to detect faces in the image');
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!isValidImageFile(selectedFile)) {
        setMessage({
          type: 'error',
          text: 'Please select a valid image file (JPG, PNG, or WEBP)',
        });
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'Image size should be less than 5MB',
        });
        return;
      }

      setFile(selectedFile);
      setMessage(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const isValidImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select an image to upload' });
      return;
    }

    setLoading(true);

    try {
      // Create an image element for face detection
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Detect face in the image
      const hasFace = await detectFace(img);
      URL.revokeObjectURL(imageUrl);

      if (!hasFace) {
        setMessage({
          type: 'error',
          text: 'No  human face detected in the image . Please upload a clear photo with a visible human face.'
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/verify/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data.success && response.data.conflicts) {
        console.log("The conflicts ",response.data.conflicts)
        setConflicts(response.data.conflicts);
        setTempPath(response.data.tempPath);
        setSimilarityDialog(true);
      } else {
        setMessage({ type: 'success', text: response.data.message });
        setCurrentPicture(response.data.profilePicture.url);
        setFile(null);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error uploading profile picture',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    try {
      setLoading(true);
      const response = await api.post('/verify/profile-picture/resolve-conflict', {
        tempPath,
        action: 'proceed'
      });

      setMessage({ type: 'success', text: response.data.message });
      setCurrentPicture(response.data.profilePicture.url);
      setSimilarityDialog(false);
      setFile(null);
      setTempPath(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error confirming profile picture',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = async () => {
    if (tempPath) {
      try {
        await api.post('/verify/profile-picture/resolve-conflict', {
          tempPath,
          action: 'cancel'
        });
      } catch (error) {
        console.error('Error canceling upload:', error);
      }
    }
    setSimilarityDialog(false);
    setFile(null);
    setPreview(null);
    setTempPath(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Picture Verification
        </Typography>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ width: '100%', mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ width: '100%', mb: 2 }} />}

        {currentPicture && !preview && (
          <Box sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            overflow: 'hidden',
            mb: 2,
            border: '2px solid #e0e0e0',
          }}>
            <img
              src={currentPicture}
              alt="Current profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        {preview && (
          <Box sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            overflow: 'hidden',
            mb: 2,
            border: '2px solid #e0e0e0',
          }}>
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        <input
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          id="profile-picture-upload"
          type="file"
          onChange={handleFileChange}
        />
        
        <label htmlFor="profile-picture-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<Camera />}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            {currentPicture ? 'Change Picture' : 'Select Picture'}
          </Button>
        </label>

        {file && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
            sx={{ mt: 2 }}
          >
            Upload Picture
          </Button>
        )}

        <Dialog
          open={similarityDialog}
          onClose={handleCancelUpload}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertTriangle color="orange" />
            Similar Profile Pictures Detected
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              We found similar profile pictures in our system. This might indicate a duplicate account.
              Please review the similar images below:
            </Typography>
            <Grid container spacing={2}>
              {conflicts.map((conflict, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${process.env.REACT_APP_API_URL}/${conflict.profilePicture}`}

                      alt={`Similar picture ${index + 1}`}
                    />
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Similarity: {conflict.similarity}%
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCancelUpload} 
              color="error" 
              disabled={loading}
            >
              Cancel Upload
            </Button>
            <Button 
              onClick={handleConfirmUpload} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfilePicture;
