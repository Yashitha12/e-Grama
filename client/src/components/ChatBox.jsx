import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import SingleChat from "./SingleChat.jsx";
import { ChatState } from "../context/ChatProvider.jsx";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Comment preserved from original code
  // if (!user) {
  //   return null; // Or a loading spinner
  // }

  return (
    <Box
      sx={{
        display: {
          xs: selectedChat ? 'flex' : 'none',
          sm: 'flex'
        },
        flexDirection: 'column',
        alignItems: 'center',
        padding: 3,
        bgcolor: 'background.paper',
        width: {
          xs: '100%',
          sm: '60%',
          md: '100%'
        },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '91.5vh',
        boxShadow: 1,
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;