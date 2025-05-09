import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../context/ChatProvider.jsx";
import UserListItem from "../UserAvatar/UserListItem.jsx";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleOpen = () => {
    setOpen(true);
    setGroupChatName(selectedChat?.chatName || "");
    console.log("Selected chat users:", selectedChat?.users); // Add this line
  };

  const handleClose = () => {
    setOpen(false);
    setSearch("");
    setSearchResult([]);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showAlert = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/users/search?search=${query}`, config);
      setSearchResult(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      showAlert("Failed to load search results", "error");
      setSearchResult([]);
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName || !selectedChat?._id || groupChatName === selectedChat?.chatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      if (data?._id) {
        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        showAlert("Group renamed successfully!", "success");
      }
    } catch (error) {
      showAlert(error.response?.data?.message || "Failed to rename group", "error");
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (!userToAdd?._id || !selectedChat?._id) return;

    if (selectedChat.users?.some(u => u?._id === userToAdd._id)) {
      showAlert("User already in group", "warning");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );

      if (data?._id) {
        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setSearch("");
        setSearchResult([]);
        showAlert(`${userToAdd.name || "User"} added to group`, "success");
      }
    } catch (error) {
      showAlert(error.response?.data?.message || "Failed to add user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (!userToRemove?._id || !selectedChat?._id) return;

    if (selectedChat.groupAdmin?._id !== user?._id && userToRemove._id !== user?._id) {
      showAlert("Only admins can remove members", "error");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );

      if (userToRemove._id === user?._id) {
        setSelectedChat(null);
        showAlert("You left the group", "success");
        handleClose();
      } else if (data?._id) {
        setSelectedChat(data);
        showAlert(`${userToRemove.name || "User"} removed from group`, "success");
      }
      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (error) {
      showAlert(error.response?.data?.message || "Failed to remove user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton 
        onClick={handleOpen} 
        size="small" 
        sx={{ 
          ml: 1,
          '&:hover': { 
            backgroundColor: 'rgba(25, 118, 210, 0.1)' 
          }
        }}
      >
        <VisibilityIcon color="primary" />
      </IconButton>

      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" fontWeight="bold">
            {selectedChat?.chatName || "Group"} - Settings
          </Typography>
          <IconButton 
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Group Name Section */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Update Group Name
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                size="small"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                placeholder="Enter new group name"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleRename}
                disabled={renameloading || !groupChatName || groupChatName === selectedChat?.chatName}
                sx={{ 
                  minWidth: 100,
                  height: '40px'
                }}
              >
                {renameloading ? <CircularProgress size={24} /> : "Update"}
              </Button>
            </Stack>
          </Box>

          {/* Current Members Section */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Group Members ({selectedChat?.users?.length || 0})
            </Typography>
            <List 
              dense 
              sx={{ 
                maxHeight: 300, 
                overflow: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 1,
                py: 0
              }}
            >
              {selectedChat?.users?.map((member) => (
                member && (
                  <ListItem 
                    key={member._id || Math.random()}
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none'
                      },
                      bgcolor: selectedChat?.groupAdmin?._id === member?._id 
                        ? 'rgba(25, 118, 210, 0.05)' 
                        : 'inherit'
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemove(member)}
                        disabled={loading}
                        size="small"
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          selectedChat?.groupAdmin?._id === member?._id ? (
                            <Box 
                              component="span" 
                              sx={{ 
                                fontSize: 12,
                                bgcolor: 'primary.main',
                                color: 'white',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              A
                            </Box>
                          ) : null
                        }
                      >
                        <Avatar 
                          src={member?.pic} 
                          alt={member?.name || 'User'}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: 'primary.main',
                            color: 'white'
                          }}
                        >
                          {member?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight="medium">
                          {member?.username || member?.name || 'Unknown User'}
                          {selectedChat?.groupAdmin?._id === member?._id && (
                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                              (Admin)
                            </Typography>
                          )}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {member?.email || ''}
                        </Typography>
                      }
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                )
              ))}
            </List>
          </Box>

          {/* Add Members Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Add New Members
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users by name or email"
              sx={{ mb: 2 }}
            />

            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : searchResult.length > 0 ? (
              <List 
                dense 
                sx={{ 
                  maxHeight: 200, 
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  py: 0
                }}
              >
              {searchResult.map((userResult) => (
                <UserListItem
                  key={userResult?._id}
                  user={userResult}
                  handleFunction={() => handleAddUser(userResult)}
                  actionText="Add"
                  actionColor="success"
                  showEmail
                />
              ))}
              </List>
            ) : search ? (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center"
                py={3}
              >
                No users found matching "{search}"
              </Typography>
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center"
                py={3}
              >
                Search for users to add to the group
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={() => handleRemove(user)}
            variant="outlined"
            color="error"
            disabled={loading}
            startIcon={<CloseIcon />}
            sx={{ 
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)'
              }
            }}
          >
            Leave Group
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            sx={{
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            Done
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
          sx={{ 
            width: '100%',
            boxShadow: 3
          }}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateGroupChatModal;