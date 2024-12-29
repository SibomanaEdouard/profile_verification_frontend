// import { useState } from 'react';
// import {
//   Button,
//   Container,
//   Typography,
//   Box,
//   Alert,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Card,
//   CardMedia,
//   Grid,
// } from '@mui/material';
// import { Camera, Upload, AlertTriangle } from 'lucide-react';
// import api from '../../services/api';
// import { useAuth } from '../../context/AuthContext';

// const ProfilePicture = () => {
//   const { user } = useAuth();
// console.log(user)
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [similarityDialog, setSimilarityDialog] = useState(false);
//   const [similarPictures, setSimilarPictures] = useState([]);
//   const [currentPicture, setCurrentPicture] = useState(null);

//   // useEffect(() => {
//   //   // Fetch current profile picture if exists
//   //   const fetchCurrentPicture = async () => {
//   //     try {
//   //       const response = await api.get('/profile/picture');
//   //       if (response.data.url) {
//   //         setCurrentPicture(response.data.url);
//   //       }
//   //     } catch (error) {
//   //       console.error('Error fetching profile picture:', error);
//   //     }
//   //   };

//   //   fetchCurrentPicture();
//   // }, []);

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0];
//     if (selectedFile) {
//       if (!isValidImageFile(selectedFile)) {
//         setMessage({
//           type: 'error',
//           text: 'Please select a valid image file (JPG, PNG, or WEBP)',
//         });
//         return;
//       }

//       if (selectedFile.size > 5 * 1024 * 1024) {
//         setMessage({
//           type: 'error',
//           text: 'Image size should be less than 5MB',
//         });
//         return;
//       }

//       setFile(selectedFile);
//       setMessage(null);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const isValidImageFile = (file) => {
//     const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//     return validTypes.includes(file.type);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       setMessage({ type: 'error', text: 'Please select an image to upload' });
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append('profilePicture', file);

//     try {
//       const response = await api.post('/verify/profile-picture', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       // Check for similar images
//       if (response.data.similarImages && response.data.similarImages.length > 0) {
//         setSimilarPictures(response.data.similarImages);
//         setSimilarityDialog(true);
//         return;
//       }

//       setMessage({ type: 'success', text: 'Profile picture uploaded successfully' });
//       setCurrentPicture(response.data.url);
//       // Clear the file input
//       setFile(null);
//       setPreview(null);
//     } catch (error) {
//       setMessage({
//         type: 'error',
//         text: error.response?.data?.message || 'Error uploading profile picture',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirmUpload = async () => {
//     try {
//       const response = await api.post('/verification/confirm-picture', {
//         confirmUpload: true,
//       });
//       setMessage({ type: 'success', text: 'Profile picture confirmed and uploaded successfully' });
//       setCurrentPicture(response.data.url);
//       setSimilarityDialog(false);
//       // Clear the file input
//       setFile(null);
//       setPreview(null);
//     } catch (error) {
//       setMessage({
//         type: 'error',
//         text: error.response?.data?.message || 'Error confirming profile picture',
//       });
//     }
//   };

//   const handleCancelUpload = () => {
//     setSimilarityDialog(false);
//     setFile(null);
//     setPreview(null);
//   };

//   return (
//     <Container maxWidth="sm">
//       <Box
//         sx={{
//           mt: 4,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}
//       >
//         <Typography variant="h4" component="h1" gutterBottom>
//           Profile Picture
//         </Typography>

//         {message && (
//           <Alert 
//             severity={message.type} 
//             sx={{ width: '100%', mb: 2 }}
//             onClose={() => setMessage(null)}
//           >
//             {message.text}
//           </Alert>
//         )}

//         {currentPicture && !preview && (
//           <Box
//             sx={{
//               width: 200,
//               height: 200,
//               borderRadius: '50%',
//               overflow: 'hidden',
//               mb: 2,
//               border: '2px solid #e0e0e0',
//             }}
//           >
//             <img
//               src={currentPicture}
//               alt="Current profile"
//               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//             />
//           </Box>
//         )}

//         {preview && (
//           <Box
//             sx={{
//               width: 200,
//               height: 200,
//               borderRadius: '50%',
//               overflow: 'hidden',
//               mb: 2,
//               border: '2px solid #e0e0e0',
//             }}
//           >
//             <img
//               src={preview}
//               alt="Preview"
//               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//             />
//           </Box>
//         )}

//         <input
//           accept="image/jpeg,image/png,image/webp"
//           style={{ display: 'none' }}
//           id="profile-picture-upload"
//           type="file"
//           onChange={handleFileChange}
//         />
        
//         <label htmlFor="profile-picture-upload">
//           <Button
//             variant="outlined"
//             component="span"
//             startIcon={<Camera />}
//             sx={{ mb: 2 }}
//           >
//             {currentPicture ? 'Change Picture' : 'Select Picture'}
//           </Button>
//         </label>

//         {file && (
//           <Button
//             variant="contained"
//             onClick={handleUpload}
//             disabled={loading}
//             startIcon={<Upload />}
//             sx={{ mt: 2 }}
//           >
//             {loading ? <CircularProgress size={24} /> : 'Upload Picture'}
//           </Button>
//         )}

//         {/* Similar Pictures Dialog */}
//         <Dialog
//           open={similarityDialog}
//           onClose={handleCancelUpload}
//           maxWidth="md"
//           fullWidth
//         >
//           <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <AlertTriangle color="orange" />
//             Similar Pictures Found
//           </DialogTitle>
//           <DialogContent>
//             <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//               We found similar profile pictures in our system. This might indicate a duplicate account.
//               Do you want to proceed with the upload?
//             </Typography>
//             <Grid container spacing={2}>
//               {similarPictures.map((picture, index) => (
//                 <Grid item xs={12} sm={6} md={4} key={index}>
//                   <Card>
//                     <CardMedia
//                       component="img"
//                       height="140"
//                       image={picture.url}
//                       alt={`Similar picture ${index + 1}`}
//                     />
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCancelUpload} color="error">
//               Cancel Upload
//             </Button>
//             <Button onClick={handleConfirmUpload} variant="contained" color="primary">
//               Confirm Upload
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </Container>
//   );
// };

// export default ProfilePicture;


import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchCurrentPicture = async () => {
      try {
        if (user?.profilePicture?.url) {
          setCurrentPicture(user.profilePicture.url);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchCurrentPicture();
  }, [user]);

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
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await api.post('/verify/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data.success && response.data.conflicts) {
        setConflicts(response.data.conflicts);
        setTempPath(response.data.tempPath);
        setSimilarityDialog(true);
      } else {
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully' });
        setCurrentPicture(response.data.profilePicture.url);
        setFile(null);
        setPreview(null);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error uploading profile picture',
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

      setMessage({ type: 'success', text: 'Profile picture confirmed and uploaded successfully' });
      setCurrentPicture(response.data.profilePicture.url);
      setSimilarityDialog(false);
      setFile(null);
      setPreview(null);
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
                      image={conflict.profilePicture}
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
