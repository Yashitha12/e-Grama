import { Chip, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Chip
      label={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user.name}
          {admin === user._id && <span style={{ marginLeft: "4px" }}> (Admin)</span>}
        </Box>
      }
      onDelete={handleFunction}
      deleteIcon={<CloseIcon fontSize="small" />}
      sx={{
        margin: "4px",
        marginBottom: "8px",
        backgroundColor: "#9c27b0", // purple color
        color: "white",
        fontSize: "12px",
        borderRadius: "8px",
        padding: "0 4px",
        cursor: "pointer",
        "& .MuiChip-deleteIcon": {
          color: "white",
          "&:hover": {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      }}
    />
  );
};

export default UserBadgeItem;