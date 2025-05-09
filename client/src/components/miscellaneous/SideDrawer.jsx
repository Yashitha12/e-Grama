import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  AppBar,
  Toolbar
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading.jsx";
import ProfileModal from "./ProfileModel.jsx";
import { getSender } from "../../config/ChatLogics.jsx";
import UserListItem from "../UserAvatar/UserListItem.jsx";
import { ChatState } from "../../context/ChatProvider.jsx";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleProfileModalOpen = () => {
    setProfileModalOpen(true);
    handleProfileMenuClose();
  };

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showAlert = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const logoutHandler = () => {
    window.dispatchEvent(new Event("logout"));
    sessionStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      showAlert("Please Enter something in search", "warning");
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:5000/api/users/search?search=${search}`, config);
      setLoading(false);
      setSearchResult(
        data.map((user) => ({
          ...user,
          name: user.name || user.username,
          email: user.email || 'No email provided',
        }))
      );
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid, redirect to login
        showAlert("Session Expired. Please log in again.", "error");
        sessionStorage.removeItem("userInfo");
        navigate("/");
        return;
      }
      showAlert("Failed to Load the Search Results", "error");
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`http://localhost:5000/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      handleDrawerClose();
    } catch (error) {
      showAlert(`Error fetching the chat: ${error.message}`, "error");
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#5D3FD3", px: 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tooltip title="Search Users to chat" arrow>
            <Button 
              color="inherit" 
              startIcon={<SearchIcon />} 
              onClick={handleDrawerOpen}
              sx={{ textTransform: 'none' }}
            >
              <Typography sx={{ display: { xs: "none", md: "flex" } }}>
                Search User
              </Typography>
            </Button>
          </Tooltip>

          <Typography variant="h5" fontFamily="Work sans" sx={{ flexGrow: 1, textAlign: "center" }}>
            e - Connect
          </Typography>

          <Box display="flex" alignItems="center">
            <Box position="relative">
              <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                {notification.length > 0 && (
                  <Badge 
                    badgeContent={notification.length} 
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.8rem"
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                )}
                {!notification.length && <NotificationsIcon />}
              </IconButton>
              <Menu
                anchorEl={notificationMenuAnchor}
                open={Boolean(notificationMenuAnchor)}
                onClose={handleNotificationMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {!notification.length && <MenuItem disabled>No New Messages</MenuItem>}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                      handleNotificationMenuClose();
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Button 
              color="inherit"
              onClick={handleProfileMenuOpen}
              endIcon={<ExpandMoreIcon />}
              sx={{ 
                ml: 1,
                bgcolor: "white", 
                color: "black",
                "&:hover": {
                  bgcolor: "#f5f5f5"
                }
              }}
            >
              <Avatar
                sx={{ width: 30, height: 30 }}
                alt={user.name}
                src={user.pic}
              >
                {user.name?.[0]}
              </Avatar>
            </Button>
            
            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileModalOpen}>My Profile</MenuItem>
              <Divider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
      >
        <Box sx={{ width: 300 }} role="presentation">
          <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            Search Users
          </Typography>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="contained" onClick={handleSearch}>Go</Button>
            </Stack>
            
            {loading ? (
              <ChatLoading />
            ) : (
              <Box>
                {searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))}
              </Box>
            )}
            
            {loadingChat && (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      <ProfileModal 
        user={{ ...user }} 
        open={profileModalOpen} 
        onClose={handleProfileModalClose} 
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SideDrawer;