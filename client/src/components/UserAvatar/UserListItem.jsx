import { Avatar, Box, Typography, Paper } from "@mui/material";

const UserListItem = ({ user, handleFunction, actionText, actionColor = "primary", showEmail = false }) => {
  // Safely extract user properties with fallbacks
  const userName = user?.name || user?.username || 'Unknown User';
  const userEmail = user?.email || '';
  const userPic = user?.pic || user?.profilePicture || user?.avatar || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <Paper
      onClick={handleFunction}
      sx={{
        cursor: "pointer",
        backgroundColor: "#E8E8E8",
        "&:hover": {
          backgroundColor: "#38B2AC",
          color: "white",
        },
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "black",
        px: 2,
        py: 1.5,
        mb: 1.5,
        borderRadius: 1,
      }}
      elevation={0}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar 
          sx={{ 
            mr: 2,
            width: 40,
            height: 40,
            bgcolor: '#38B2AC',
            color: 'white'
          }} 
          alt={userName} 
          src={userPic}
        >
          {userInitial}
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight="medium">
            {userName}
          </Typography>
          {showEmail && userEmail && (
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          )}
        </Box>
      </Box>
      {actionText && (
        <Typography 
          variant="body2" 
          color={`${actionColor}.main`}
          fontWeight="medium"
        >
          {actionText}
        </Typography>
      )}
    </Paper>
  );
};

export default UserListItem;