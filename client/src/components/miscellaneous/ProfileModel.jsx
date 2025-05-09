import { Visibility } from "@mui/icons-material";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Divider,
  Chip
} from "@mui/material";
import { useState } from "react";

const ProfileModal = ({ user = {}, children }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = (e) => {
    console.log("[ProfileModal] Open button clicked");
    e?.stopPropagation?.();
    setOpen(true);
  };

  const handleClose = () => {
    console.log("[ProfileModal] Closing modal");
    setOpen(false);
  };

  console.log("[ProfileModal] Current state - open:", open, "user:", user);

  // Safely get user properties
  const displayName = user?.username || "Unknown User";
  const userPic = user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
  const isAdmin = user?.isAdmin || false;

  return (
    <>
      {children ? (
        <div 
          onClick={handleOpen} 
          style={{ display: 'inline-block', cursor: 'pointer' }}
        >
          {children}
        </div>
      ) : (
        <IconButton
          sx={{ display: { xs: "flex" } }}
          onClick={handleOpen}
          aria-label="View profile"
          data-testid="profile-modal-button"
        >
          <Visibility />
        </IconButton>
      )}
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="profile-modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            width: "90%",
            maxWidth: "400px",
            p: 3,
            outline: "none",
            position: 'relative'
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              src={userPic}
              alt={displayName}
              sx={{ 
                width: 120, 
                height: 120,
                mb: 2
              }}
            />
            
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              {displayName}
              {isAdmin && (
                <Chip 
                  label="Admin" 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
            
            <Divider sx={{ width: '100%', my: 2 }} />
            
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" paragraph>
                <strong>Username:</strong> {displayName}
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>User ID:</strong> {user?._id || "Unknown"}
              </Typography>
              
              <Typography variant="body1">
                <strong>Status:</strong> {isAdmin ? "Administrator" : "Standard User"}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleClose}
              sx={{ px: 4 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileModal;