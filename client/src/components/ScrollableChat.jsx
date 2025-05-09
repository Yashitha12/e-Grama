import { Avatar } from "@mui/material";
import { Tooltip, Box, Typography } from "@mui/material";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics.jsx";
import { ChatState } from "../context/ChatProvider.jsx";
import { useEffect } from "react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  // Debug: Log messages when they change
  useEffect(() => {
    console.log("ScrollableChat received messages:", messages);
    if (messages.length > 0) {
      console.log("First message sender data:", messages[0].sender);
    }
  }, [messages]);

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return "";
      }
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  const getDisplayName = (sender) => {
    if (!sender) return "Unknown User";
    return sender.name || sender.username || "Unknown User";
  };

  return (
    <ScrollableFeed>
      {messages && messages.length > 0 ? (
        messages.map((m, i) => {
          // Skip invalid messages
          if (!m || !m._id || !m.content) {
            console.warn("Invalid message object:", m);
            return null;
          }

          const sender = m.sender || {};
          const senderId = sender._id || "unknown";
          const isCurrentUser = senderId === user._id;
          const displayName = getDisplayName(sender);
          const isBot = senderId === "ai-bot" || displayName.includes("AI");

          return (
            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                mb: 2,
                alignItems: "flex-end",
                gap: 1
              }} 
              key={m._id}
            >
              {!isCurrentUser && (
                <Tooltip title={displayName} placement="bottom-start" arrow>
                  <Avatar
                    sx={{ 
                      width: 32,
                      height: 32,
                      cursor: "pointer",
                      bgcolor: stringToColor(displayName) // Add this function or use a default color
                    }}
                    alt={displayName}
                    src={sender.pic || ""}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              )}

              <Box 
                sx={{
                  display: "flex", 
                  flexDirection: "column", 
                  maxWidth: "75%"
                }}
              >
                {!isCurrentUser && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "text.secondary",
                      ml: 1,
                      mb: 0.5
                    }}
                  >
                    {displayName}
                  </Typography>
                )}
                <Box
                  sx={{
                    backgroundColor: isBot 
                      ? "#ff9999" 
                      : isCurrentUser 
                        ? "#BEE3F8" 
                        : "#B9F5D0",
                    borderRadius: "18px",
                    padding: "8px 16px",
                    maxWidth: "100%",
                    wordBreak: "break-word",
                    boxShadow: 1
                  }}
                >
                  <Typography variant="body1">
                    {m.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "text.secondary",
                      display: "block",
                      textAlign: "right",
                      mt: 0.5
                    }}
                  >
                    {formatTime(m.createdAt || new Date())}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })
      ) : (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No messages to display
          </Typography>
        </Box>
      )}
    </ScrollableFeed>
  );
};

// Helper function to generate color from string (optional)
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 70%)`;
  return color;
};

export default ScrollableChat;