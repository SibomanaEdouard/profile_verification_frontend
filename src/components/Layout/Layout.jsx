import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu as MenuIcon } from 'lucide-react';
import Notification from '../Notification/Notification';
import AccountSettingsModal from '../settings/AccountSetting';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Notification/>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mpuza Verification
          </Typography>
          {user && (
            <div>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/verification')}>
                  ID Verification
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/profile-picture')}>
                  Profile Picture
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/status')}>
                  Verification Status
                </MenuItem>
                <MenuItem onClick={() => {
                  handleClose();
                  setSettingsOpen(true);
                }}>
                  Settings
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      <AccountSettingsModal 
        open={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Mpuza, Inc. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
