import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton,
  Card,
  Typography,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { X as CloseIcon, User, Lock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AccountSettingsModal = ({ open, onClose }) => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const {logout}=useAuth()

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await api.delete('/delete-account');
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Account deleted successfully',
          severity: 'success'
        });
        // Add a small delay before redirect to show the message
        setTimeout(() => {
          window.location.href = '/logout';
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete account. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/logout';
  };

  const Section = ({ icon: Icon, title, description, variant = "default" }) => (
    <Card 
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: variant === "danger" ? '#FEF2F2' : '#fff',
        border: 1,
        borderColor: variant === "danger" ? '#FCA5A5' : '#E5E7EB',
        '&:hover': {
          borderColor: '#93C5FD',
          transition: 'border-color 0.2s ease-in-out'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Icon 
          style={{ 
            color: variant === "danger" ? '#EF4444' : '#3B82F6',
            width: '24px',
            height: '24px'
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: variant === "danger" ? '#EF4444' : '#1F2937',
            fontSize: '1.125rem',
            fontWeight: 600
          }}
        >
          {title}
        </Typography>
      </div>
      <Typography 
        sx={{ 
          marginLeft: '36px',
          color: '#4B5563'
        }}
      >
        {description}
      </Typography>
    </Card>
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{
            background: 'linear-gradient(to right, #2563EB, #1D4ED8)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Account Settings
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: '#F9FAFB', p: 3 }}>
          <Section 
            icon={User}
            title="Account Information"
            description="View and manage your account details"
          />

          <Section 
            icon={Lock}
            title="Privacy Settings"
            description="Manage your privacy settings and data"
          />

          <div style={{ marginTop: '2rem' }}>
            <Section 
              icon={AlertTriangle}
              title="Danger Zone"
              description="Delete account and manage critical settings"
              variant="danger"
            />
            
            <Card sx={{ 
              p: 2,
              border: 1,
              borderColor: '#FCA5A5'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Delete Account
              </Typography>
              <Typography sx={{ color: '#4B5563', mb: 2 }}>
                Once you delete your account, there is no going back. This will permanently remove all your data.
              </Typography>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="primary"
                  startIcon={<User />}
                  sx={{ 
                    textTransform: 'none',
                    backgroundColor: '#3B82F6',
                    '&:hover': {
                      backgroundColor: '#2563EB',
                    }
                  }}
                >
                  Logout
                </Button>
                <Button
                  onClick={() => setDeleteModalOpen(true)}
                  variant="contained"
                  color="error"
                  startIcon={<AlertTriangle />}
                  sx={{ 
                    textTransform: 'none',
                    backgroundColor: '#DC2626',
                    '&:hover': {
                      backgroundColor: '#B91C1C',
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteAccountModal
        open={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const DeleteAccountModal = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '0.75rem',
          p: 2
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
          <AlertTriangle />
          <Typography variant="h6">Confirm Account Deletion</Typography>
        </div>
        <IconButton 
          onClick={onClose}
          sx={{ color: '#9CA3AF' }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      <Card sx={{ 
        bgcolor: '#FEF2F2', 
        border: 1,
        borderColor: '#FCA5A5',
        p: 2,
        mb: 3
      }}>
        <Typography sx={{ color: '#4B5563', mb: 2 }}>
          This action cannot be undone. This will permanently delete your account and remove all associated data.
        </Typography>
        <ul style={{ 
          color: '#4B5563',
          marginLeft: '1.5rem',
          listStyle: 'none'
        }}>
          {['All your personal information', 'Account settings and preferences', 'All activity history'].map((item, index) => (
            <li key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: '#EF4444' }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<AlertTriangle />}
          sx={{ textTransform: 'none' }}
        >
          Delete Account
        </Button>
      </div>
    </Dialog>
  );
};

export default AccountSettingsModal;