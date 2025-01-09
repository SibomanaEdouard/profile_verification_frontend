/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { 
  Badge,
  IconButton,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Popover,
  Snackbar
} from '@mui/material';
import { Bell, X, Check, Image, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); 
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showSnackbar('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setUnreadCount(0);
      fetchNotifications();
      showSnackbar('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showSnackbar('Failed to mark notifications as read', 'error');
    }
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      setActionLoading(notificationId);
      
      const response = await api.post('/notifications/profile-picture-decision', {
        notificationId,
        action
      });

      if (response.data.success) {
        showSnackbar(`Profile picture successfully ${action}ed`, 'success');
        // Remove the processed notification from the list
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        showSnackbar(response.data.message || `Failed to ${action} profile picture`, 'error');
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
      showSnackbar(`Failed to ${action} profile picture`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="large"
        sx={{ position: 'relative' }}
      >
        <Bell />
        {unreadCount > 0 && (
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
            }}
          />
        )}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Card sx={{ width: 400, maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6">Notifications</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshCw />}
                size="small"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </Button>
              <IconButton size="small" onClick={handleClose}>
                <X />
              </IconButton>
            </Box>
          </Box>

          <CardContent sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {notifications.map((notification) => (
                  <Alert
                    key={notification._id}
                    severity={notification.type === 'PROFILE_PICTURE_SIMILARITY' ? 'warning' : 'info'}
                    sx={{
                      backgroundColor: notification.status === 'unread' ? 'action.hover' : 'background.paper'
                    }}
                    icon={<Image />}
                    action={
                      notification.type === 'PROFILE_PICTURE_SIMILARITY' && !notification.resolved && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<Check />}
                            onClick={() => handleNotificationAction(notification._id, 'approve')}
                            disabled={actionLoading === notification._id}
                          >
                            {actionLoading === notification._id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<X />}
                            onClick={() => handleNotificationAction(notification._id, 'reject')}
                            disabled={actionLoading === notification._id}
                          >
                            {actionLoading === notification._id ? 'Processing...' : 'Reject'}
                          </Button>
                        </Box>
                      )
                    }
                  >
                    <Typography variant="subtitle2" component="div">
                      {notification.type === 'PROFILE_PICTURE_SIMILARITY' ? 'Profile Picture Request' :
                       notification.type === 'PROFILE_PICTURE_APPROVED' ? 'Profile Picture Approved' :
                       notification.type === 'PROFILE_PICTURE_REJECTED' ? 'Profile Picture Rejected' :
                       'Notification'}
                    </Typography>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    {notification.data?.similarity && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                        Similarity: {notification.data.similarity}%
                      </Typography>
                    )}
                  </Alert>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>No notifications</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}