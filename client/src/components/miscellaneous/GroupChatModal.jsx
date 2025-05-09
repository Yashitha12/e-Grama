import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useState, useEffect } from "react";
import { ChatState } from "../../context/ChatProvider.jsx";
import UserBadgeItem from "../UserAvatar/UserBadgeItem.jsx";
import UserListItem from "../UserAvatar/UserListItem.jsx";

const GroupChatModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const { user, chats, setChats } = ChatState();

  useEffect(() => {
    if (user) {
      console.log("Current user:", user);
    }
  }, [user]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form state when closing
    setGroupChatName("");
    setSelectedUsers([]);
    setSearchResult([]);
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

  const handleGroup = (userToAdd) => {
    if (!userToAdd || !userToAdd._id) {
      console.error("Invalid user object:", userToAdd);
      showAlert("Invalid user data", "error");
      return;
    }

    if (selectedUsers.some(selectedUser => selectedUser._id === userToAdd._id)) {
      showAlert("User already added", "warning");
      return;
    }
    
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      
      // Check if user token exists
      if (!user || !user.token) {
        console.error("User token is missing");
        showAlert("Authentication error. Please login again.", "error");
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.get(`http://localhost:5000/api/users/search?search=${query}`, config);
      console.log("Search results:", data);
      
      const resultsArray = Array.isArray(data) ? data.filter(user => user && user._id) : [];
      setSearchResult(resultsArray);
    } catch (error) {
      console.error("Search error:", error);
      showAlert(`Failed to load search results: ${error.message}`, "error");
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    console.log("Removing user:", delUser);
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName) {
      showAlert("Please enter a group name", "warning");
      return;
    }
    
    if (selectedUsers.length < 2) {
      showAlert("Please add at least 2 users to the group", "warning");
      return;
    }

    // Check if user is logged in
    if (!user || !user.token) {
      showAlert("Authentication error. Please login again.", "error");
      return;
    }

    try {
      setSubmitting(true);
      console.log("Creating group chat with name:", groupChatName);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
      };

      // Extract just the user IDs from the selected users
      const userIds = selectedUsers.map(u => u._id);
      console.log("User IDs for group:", userIds);
      
      // This format matches what your backend expects
      const payload = {
        name: groupChatName,
        users: userIds  // Send as an array
      };
      
      console.log("Sending payload:", payload);
      
      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
        payload,
        config
      );
      
      console.log("Server response:", data);
      
      if (data && data._id) {
        setChats([data, ...chats]);
        handleClose();
        showAlert("New Group Chat Created!", "success");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Create group chat error:", error);
      let errorMessage = "Failed to Create the Chat!";
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        errorMessage = error.response.data?.message || error.response.data || errorMessage;
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Custom user badge component
  const CustomUserBadge = ({ user, handleFunction }) => {
    return (
      <Chip
        label={user.name || user.username || user.email || user._id || "User"}
        onDelete={handleFunction}
        color="primary"
        variant="outlined"
        sx={{ m: 0.5 }}
      />
    );
  };

  return (
    <>
      <span onClick={handleOpen}>{children}</span>

      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: 24, fontFamily: "Work sans" }}>
          Create Group Chat
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Chat Name"
              fullWidth
              variant="outlined"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Add Users eg: user 1, user 2, user 3"
              fullWidth
              variant="outlined"
              onChange={(e) => handleSearch(e.target.value)}
            />
            
            {selectedUsers.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", mt: 2 }}>
                <Typography variant="subtitle1" sx={{ width: "100%", mb: 1 }}>
                  Selected Users ({selectedUsers.length}):
                </Typography>
                {selectedUsers.map((u) => (
                  <CustomUserBadge
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                Array.isArray(searchResult) && searchResult.length > 0 ? (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Search Results:
                    </Typography>
                    {searchResult
                      .slice(0, 4)
                      .map((user) => (
                        <UserListItem
                          key={user._id}
                          user={user}
                          handleFunction={() => handleGroup(user)}
                        />
                      ))}
                  </>
                ) : (
                  searchResult.length === 0 && 
                  <Typography color="textSecondary" sx={{ mt: 1 }}>
                    No users found
                  </Typography>
                )
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!groupChatName || selectedUsers.length < 2 || submitting}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: "white" }} />
                Creating...
              </>
            ) : (
              "CREATE CHAT"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
};

export default GroupChatModal;