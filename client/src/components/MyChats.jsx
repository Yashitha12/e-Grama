import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Stack, 
  Typography, 
  Avatar,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getSender } from "../config/ChatLogics.jsx";
import ChatLoading from "./ChatLoading.jsx";
import GroupChatModal from "./miscellaneous/GroupChatModal.jsx";
import { ChatState } from "../context/ChatProvider.jsx";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats = [], setChats } = ChatState();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  // Auto-refresh interval in milliseconds (e.g., 3000 = 3 seconds)
  const REFRESH_INTERVAL = 3000;

  const getSenderUser = (loggedUser, users) => {
    if (!loggedUser || !users || users.length < 2) {
      return { pic: "", name: "", username: "Unknown User" };
    }
    return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/chat", config);
      console.log("[MyChats] Fetched Chats:", data);
      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        enqueueSnackbar("Failed to Load the chats", { 
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' }
        });
        localStorage.removeItem("userInfo");
        navigate("/");
        return;
      }

      console.error("Error fetching chats:", error);
      enqueueSnackbar("Failed to Load the chats", { 
        variant: 'error',
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
      });
      setChats([]);
    }
  };

  // Initial fetch when component mounts or fetchAgain changes
  useEffect(() => {
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/");
      return;
    }
    console.log("[MyChats] User Info from sessionStorage:", userInfo);
    setLoggedUser(userInfo);
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!user) return;
    
    // Set up polling interval for chat updates
    const intervalId = setInterval(() => {
      fetchChats();
    }, REFRESH_INTERVAL);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { 
          xs: selectedChat ? "none" : "flex", 
          sm: "flex" 
        },
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        bgcolor: 'background.paper',
        width: { 
          xs: "100%", 
          sm: "40%", 
          md: "100%" 
        },
        height: "91.5vh",
        overflowY: "auto",
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          pb: 3,
          px: 3,
          fontSize: { xs: '1.5rem', md: '1.75rem' },
          fontFamily: '"Work Sans", sans-serif',
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          My Chats
        </Typography>
        <GroupChatModal>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{
              fontSize: { 
                xs: "0.85rem", 
                md: "0.7rem", 
                lg: "0.85rem" 
              }
            }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          bgcolor: "#F8F8F8",
          width: "100%",
          height: "100%",
          borderRadius: 2,
          overflowY: "hidden",
        }}
      >
        {!chats || chats.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
          >
            {!chats ? (
              <ChatLoading />
            ) : (
              <Typography variant="body1" color="text.secondary">
                No chats available. Start a new conversation!
              </Typography>
            )}
          </Box>
        ) : (
          <List 
            sx={{ 
              overflowY: "auto", 
              width: '100%', 
              p: 0,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              }
            }}
          >
            {chats.map((chat) => {
              const sender = getSender(loggedUser, chat.users);
              const senderUser = getSenderUser(loggedUser, chat.users);
              
              return (
                <React.Fragment key={chat._id}>
                  <ListItem 
                    onClick={() => setSelectedChat(chat)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: selectedChat === chat ? theme.palette.primary.main : "#E8E8E8",
                      color: selectedChat === chat ? "white" : "black",
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: selectedChat === chat ? theme.palette.primary.dark : "#D8D8D8",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={chat.isGroupChat ? chat.chatName : sender}
                        src={chat.isGroupChat ? undefined : senderUser.pic}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="bold"
                          color={selectedChat === chat ? "white" : "black"}
                        >
                          {!chat.isGroupChat ? sender : chat.chatName}
                        </Typography>
                      }
                      secondary={
                        chat.latestMessage && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: selectedChat === chat ? "rgba(255,255,255,0.7)" : "text.secondary",
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Box component="span" fontWeight="bold">
                              {chat.latestMessage.sender && 
                                (chat.latestMessage.sender.name || chat.latestMessage.sender.username || "Unknown")}:
                            </Box>{' '}
                            {chat.latestMessage.content.length > 50
                              ? `${chat.latestMessage.content.substring(0, 50)}...`
                              : chat.latestMessage.content}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default MyChats;