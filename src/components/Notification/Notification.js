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
  Popover
} from '@mui/material';
import { Bell, X, Check, Image, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      await api.delete(`/notifications/${notificationId}`, {
        data: { action }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
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
                    severity="info"
                    sx={{
                      backgroundColor: notification.status === 'unread' ? 'action.hover' : 'background.paper'
                    }}
                    icon={<Image />}
                    action={
                      notification.type === 'upload_conflict' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<Check />}
                            onClick={() => handleNotificationAction(notification._id, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<X />}
                            onClick={() => handleNotificationAction(notification._id, 'reject')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )
                    }
                  >
                    <Typography variant="subtitle2" component="div">
                      Profile Picture Conflict
                    </Typography>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
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
    </div>
  );
}