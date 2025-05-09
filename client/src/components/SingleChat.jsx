import { useState, useEffect, useRef } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  CircularProgress, 
  TextField,
  FormControl,
  Badge,
  useTheme
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import { useSnackbar } from 'notistack'; // Material UI alternative for toast
import { getSender, getSenderFull } from "../config/ChatLogics.jsx";
import ProfileModal from "./miscellaneous/ProfileModel.jsx";
import ScrollableChat from "./ScrollableChat.jsx";
import "./styles.css";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal.jsx";
import { ChatState } from "../context/ChatProvider.jsx";

const ENDPOINT = "http://localhost:5000";
// Remove the global socket variable and use a ref instead
var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { enqueueSnackbar } = useSnackbar(); // Replace toast with snackbar
  const theme = useTheme();
  
  // Use a ref to persist the socket instance between renders
  const socketRef = useRef(null);
  // Set auto-refresh interval (in milliseconds)
  const REFRESH_INTERVAL = 5000; // 5 seconds
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  // Ref to track the refresh interval
  const refreshIntervalRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat || !isMountedRef.current) return;

    console.log("Fetching messages for chat ID:", selectedChat._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Don't show loading indicator for auto-refresh
      if (!refreshIntervalRef.current) {
        setLoading(true);
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );
      console.log("Messages fetched:", data);
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("Unexpected response format:", data);
        setMessages([]);
        enqueueSnackbar("Unexpected response format from server", { 
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        });
      }
  
      setLoading(false);
      
      // Check if socket exists before emitting
      if (socketRef.current) {
        socketRef.current.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error.message);
      // Only show error if not an auto-refresh
      if (!refreshIntervalRef.current) {
        setMessages([]);
        enqueueSnackbar(error.response?.data?.message || "Failed to Load the Messages", { 
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        });
        setLoading(false);
      }
    }
  };

// Updated sendMessage function in SingleChat.jsx

const sendMessage = async (event) => {
  if (event.key === "Enter" && newMessage) {
    if (socketRef.current) {
      socketRef.current.emit("stop typing", selectedChat._id);
    }
    
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const messageToSend = newMessage;
      setNewMessage("");

      // Create a proper temporary message with complete sender info
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: messageToSend,
        sender: {
          _id: user._id,
          name: user.name,
          username: user.username,
          pic: user.pic,
          email: user.email
        },
        chat: selectedChat,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      const { data } = await axios.post(
        `http://localhost:5000/api/message`,
        {
          content: messageToSend,
          chatId: selectedChat._id,
        },
        config
      );
      
      if (socketRef.current) {
        socketRef.current.emit("new message", data);
      }
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempMessage._id ? data : msg
        )
      );
      
    } catch (error) {
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg._id.startsWith('temp-'))
      );
      enqueueSnackbar("Failed to send the Message", { 
        variant: 'error',
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
      });
    }
  }
};

// Add this function to help debug message structure:
const checkMessageFormat = () => {
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    console.log("Last message structure:", {
      id: lastMessage._id,
      content: lastMessage.content,
      sender: {
        id: lastMessage.sender?._id,
        name: lastMessage.sender?.name
      },
      hasSender: !!lastMessage.sender,
      createdAt: lastMessage.createdAt
    });
  } else {
    console.log("No messages to check");
  }
};

// Set up auto-refresh when component mounts or selectedChat changes
useEffect(() => {
  fetchMessages();
  selectedChatCompare = selectedChat;
  
  // Add this line to check message format after fetch
  setTimeout(() => {
    if (messages.length > 0 && isMountedRef.current) {
      checkMessageFormat();
    }
  }, 1000);

  // Set up message auto-refresh interval
  if (selectedChat) {
    // Clear any existing interval first
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current && selectedChat) {
        console.log("Auto-refreshing messages for chat:", selectedChat.chatName || "Private Chat");
        fetchMessages();
      }
    }, REFRESH_INTERVAL);
  }

  // Cleanup function
  return () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };
}, [selectedChat]);

  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    socketRef.current = io(ENDPOINT);
    
    if (socketRef.current) {
      socketRef.current.on("connect", () => {
        console.log("Socket.IO connected:", socketRef.current.id);
        setSocketConnected(true);
      });
      
      socketRef.current.on("connect_error", (err) => {
        console.error("Socket.IO connection error:", err.message);
      });
      
      socketRef.current.emit("setup", user);
      
      socketRef.current.on("connected", () => {
        console.log("User connected via Socket.IO");
        setSocketConnected(true);
      });
      
      socketRef.current.on("typing", () => setIsTyping(true));
      socketRef.current.on("stop typing", () => setIsTyping(false));
      
      socketRef.current.on("getUsers", (users) => {
        setOnlineUsers(users);
      });
    }

    // Set component mounted flag
    isMountedRef.current = true;
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket.IO disconnected");
      }
    };
  }, [user]);

  useEffect(() => {
    // Ensure socket exists before attaching listeners
    if (!socketRef.current) return;
    
    const handleNewMessage = (newMessageRecieved) => {
      console.log("Message received via Socket.IO:", newMessageRecieved);
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
      }
    };
    
    socketRef.current.on("message recieved", handleNewMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("message recieved");
      }
    };
  }, [notification, fetchAgain, selectedChat]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !socketRef.current) return;

    if (!typing) {
      setTyping(true);
      socketRef.current.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        if (socketRef.current) {
          socketRef.current.emit("stop typing", selectedChat._id);
        }
        setTyping(false);
      }
    }, timerLength);
  };

  const isAdminOnline = () => {
    const admin = selectedChat?.users.find(u => u.isAdmin);
    return admin && onlineUsers.includes(admin._id);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              pb: 3,
              px: 2,
              fontFamily: '"Work Sans", sans-serif',
            }}
          >
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setSelectedChat("")}
            >
              <ArrowBackIcon />
            </IconButton>
            
            {messages &&
              (!selectedChat.isGroupChat ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5">
                    {getSender(user, selectedChat.users)}
                  </Typography>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <Typography variant="h5">
                    {selectedChat.chatName.toUpperCase()}
                  </Typography>
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </Box>
              ))}
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 3,
              bgcolor: '#f5f5f5',
              width: '100%',
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 3,
                maxHeight: 'calc(100% - 120px)',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={60} />
                </Box>
              ) : (
                <div className="messages">
                  <ScrollableChat messages={messages} />
                </div>
              )}
            </Box>

            <FormControl fullWidth sx={{ mt: 3 }}>
              {istyping && (
                <Box sx={{ mb: 2 }}>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </Box>
              )}
              <TextField
                variant="outlined"
                fullWidth
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box 
          sx={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              pb: 3, 
              fontFamily: '"Work Sans", sans-serif',
              textAlign: 'center' 
            }}
          >
            Click on a user to start chatting
          </Typography>
        </Box>
      )}
    </>
  );
};

export default SingleChat;