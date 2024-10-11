import React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


const Header = () => {
  return (
    <Box className="header">
      <Box className="logo-section">
        <img src="https://marketplace.canva.com/EAF6IJEU9Dk/2/0/1600w/canva-black-and-white-bold-typographic-car-wash-logo-oI-9VHzYZuo.jpg" alt="Fuel Station Logo" className="logo" />
      </Box>
      <Box className="title">
        <Typography variant="h6">
          Wash Station Management
        </Typography>
      </Box>
      <Box className="user-section">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS32a2LAt7lc5lNJoPlzmb3lnNjm1iu8zMKmA&s" alt="User Avatar" className="user-avatar" />
        <Typography variant="body1" className="user-name">
          Lucia Tayler
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
