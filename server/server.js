const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require("dotenv");
const path = require('path');
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const User = require('./models/userModel');
const Chat = require('./models/chatModel');
const Message = require('./models/messageModel');
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const MainUserRoutes = require("./routes/MainUserRoutes");
const microFinanceRoutes = require('./routes/microFinanceRoutes');
const chatUserRoutes = require('./routes/chatUserRoutes');
const adminUserRoutes = require('./routes/adminUserRoute');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const axios = require('axios'); // Added missing import

const app = express();

// Load .env file with absolute path
dotenv.config({ path: path.resolve(__dirname, '.env') });
connectDB();

app.use(cors());
app.use(express.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'itpmgnofficer@gmail.com',
    pass: process.env.EMAIL_PASS || 'pzpnfitjqmijbwkt',
  },
});

app.set('transporter', transporter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/healthRecords', healthRecordRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/main-users', MainUserRoutes);
app.use('/api/message', messageRoutes);
app.use("/api/auth", authRoutes);    
app.use("/api/admin", adminRoutes);   
app.use('/api/microfinance', microFinanceRoutes);
app.use('/api/chat-user', chatUserRoutes);
app.use('/api/user-detail', adminUserRoutes);

// Initialize HTTP server and Socket.IO
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  path: "/socket.io/" // Explicitly set the path
});

// Track online users and admin user ID
let onlineUsers = new Set();
let adminUserId = null;
let botUserId = null;

// Enhanced admin/bot initialization with better error handling
const initializeSpecialUsers = async () => {
  try {
    // Admin user
    let admin = await User.findOne({ username: "admin" });
    if (!admin) {
      console.log("Creating admin user...");
      admin = await User.create({
        username: "admin",
        password: "1111",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin"
      });
    }
    adminUserId = admin._id.toString();
    console.log("Admin user ID:", adminUserId);

    // Bot user
    let botUser = await User.findOne({ username: "ai-bot" });
    if (!botUser) {
      console.log("Creating bot user...");
      botUser = await User.create({
        username: "ai-bot",
        name: "AI Assistant",
        email: "ai-bot@example.com",
        password: "botpassword",
        pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        isBot: true
      });
    }
    botUserId = botUser._id.toString();
    console.log("Bot user ID:", botUserId);
  } catch (error) {
    console.error("Error initializing special users:", error);
    process.exit(1); // Exit if we can't create these critical users
  }
};

initializeSpecialUsers();

// Enhanced Socket.IO Setup with better debugging
io.on("connection", (socket) => {
  console.log("New Socket.IO connection:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?._id) {
      console.log("Invalid setup data:", userData);
      return socket.emit("setup_error", "Invalid user data");
    }

    socket.join(userData._id);
    socket.userId = userData._id;
    onlineUsers.add(userData._id);
    io.emit("getUsers", Array.from(onlineUsers));
    socket.emit("connected");
    console.log(`User ${userData._id} setup complete`);
  });

  socket.on("join chat", (room) => {
    if (!room) {
      console.log("Invalid room:", room);
      return;
    }
    socket.join(room);
    console.log(`User ${socket.userId} joined room ${room}`);
  });

  // [Previous event handlers...]

  socket.on("new message", async (newMessageReceived) => {
    console.log("New message received:", {
      content: newMessageReceived?.content,
      sender: newMessageReceived?.sender?._id,
      chat: newMessageReceived?.chat?._id
    });

    try {
      if (!newMessageReceived?.chat?.users) {
        throw new Error("Invalid message format");
      }

      const chat = newMessageReceived.chat;
      const senderId = newMessageReceived.sender._id;

      // Add sender name
      const senderUser = await User.findById(senderId);
      newMessageReceived.sender.name = senderUser?.name || "Unknown";

      // Broadcast to other users
      chat.users.forEach(user => {
        if (user._id !== senderId) {
          socket.in(user._id).emit("message received", newMessageReceived);
          console.log(`Message sent to ${user._id}`);
        }
      });

      // Check for admin offline scenario
      const chatData = await Chat.findById(chat._id).populate("users");
      const isMessageForAdmin = chatData.users.some(u => u._id.toString() === adminUserId);
      const isAdminOnline = onlineUsers.has(adminUserId);

      console.log(`Admin check - ForAdmin: ${isMessageForAdmin}, Online: ${isAdminOnline}`);

      if (isMessageForAdmin && !isAdminOnline) {
        console.log("Attempting bot response...");
        await handleBotResponse(newMessageReceived, socket);
      }
    } catch (error) {
      console.error("Message handling error:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("getUsers", Array.from(onlineUsers));
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Enhanced bot response handler
async function handleBotResponse(message, socket) {
  console.log("Starting bot response handler");
  
  try {
    // Verify Rasa server connection
    console.log("Checking Rasa server...");
    const rasaUrl = "http://localhost:5005/webhooks/rest/webhook";
    
    const response = await axios.post(rasaUrl, {
      sender: message.sender._id,
      message: message.content
    }, { timeout: 5000 });

    console.log("Rasa response:", response.data);

    const botResponseText = response.data[0]?.text || 
      "I can only answer specific questions. Please try rephrasing your question.";

    const botMessage = {
      _id: new mongoose.Types.ObjectId().toString(),
      content: botResponseText,
      chat: message.chat._id,
      sender: { _id: botUserId, name: "AI Assistant" },
      createdAt: new Date().toISOString(),
    };

    // Save to database
    const newBotMessage = new Message({
      sender: botUserId,
      content: botResponseText,
      chat: message.chat._id,
    });
    await newBotMessage.save();
    console.log("Bot message saved to DB");

    // Broadcast response
    message.chat.users.forEach(user => {
      socket.in(user._id).emit("message received", botMessage);
      console.log(`Bot response sent to ${user._id}`);
    });

  } catch (error) {
    console.error("Bot response failed:", error.message);
    
    const errorMessage = {
      _id: new mongoose.Types.ObjectId().toString(),
      content: "Sorry, the AI assistant is currently unavailable.",
      chat: message.chat,
      sender: { _id: botUserId, name: "AI Assistant" },
      createdAt: new Date().toISOString(),
    };
    
    message.chat.users.forEach(user => {
      socket.in(user._id).emit("message received", errorMessage);
    });
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    socket: io.engine.clientsCount > 0,
    onlineUsers: Array.from(onlineUsers),
    time: new Date().toISOString()
  });
});

// Remove the duplicate app.listen - use server.listen instead
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io path: /socket.io/`);
});