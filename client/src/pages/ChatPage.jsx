import React, { useState } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChatState } from "../context/ChatProvider.jsx";
import SideDrawer from "../components/miscellaneous/SideDrawer.jsx";
import MyChats from "../components/MyChats.jsx";
import ChatBox from '../components/ChatBox.jsx';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Show loading or null if user isn't loaded yet
  if (!user) {
    return null; // Or a loading component
  }

  return (
    <ThemeProvider theme={theme}>
      <Container 
        disableGutters 
        maxWidth={false} 
        sx={{ width: '100%', height: '100vh', marginTop:'120px' }}
      >
        {user && <SideDrawer />}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            width: '100%',
            height: 'calc(100vh - 64px)', // Subtract app bar height
            padding: '10px',
            backgroundColor: '#edf2f7',
            overflow: 'hidden',
          }}
        >
          {user && (
            <Box
              sx={{
                width: isMobile ? '100%' : '30%',
                height: isMobile ? '50%' : '100%',
                marginRight: isMobile ? 0 : 2,
                marginBottom: isMobile ? 2 : 0,
              }}
            >
              <MyChats fetchAgain={fetchAgain} />
            </Box>
          )}
          
          {user && (
            <Box
              sx={{
                width: isMobile ? '100%' : '70%',
                height: isMobile ? '50%' : '100%',
                boxShadow: 1,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ChatPage;