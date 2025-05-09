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
    user: process.env.EMAIL_USER || 'itpmgnofficer@gmail.com', // Replace with your email or use environment variable
    pass: process.env.EMAIL_PASS || 'pzpnfitjqmijbwkt', // Replace with your Gmail App Password or use environment variable
  },
});

// Make transporter available to routes
app.set('transporter', transporter);


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
});

// Track online users and admin user ID
let onlineUsers = new Set();

let adminUserId = null;

// Find the admin user with password "1111" on server startup

const findAdminUser = async () => {
  try {
    const admin = await User.findOne({  username:"admin"  }); // Direct comparison for plaintext password
    if (admin) {
      adminUserId = admin._id.toString();
      console.log("Admin user found with ID:", adminUserId);
    } else {
      console.log("No admin user found with password '1111'.");
      const newAdmin = await User.create({
        username: "admin",
        password: "1111", // Will be hashed by your model
        name: "Admin User",
        email: "admin@example.com",
      });
      adminUserId = newAdmin._id.toString();
      console.log("Created admin with ID:", adminUserId);
    }
    let botUser = await User.findOne({ username: "ai-bot" });
    if (!botUser) {
      console.log("No bot user found. Creating a bot user...");
      botUser = await User.create({
        username: "ai-bot",
        name: "AI Assistant",
        email: "ai-bot@example.com",
        password: "botpassword",
        pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      });
      console.log("Created bot user with ID:", botUser._id.toString());
    }
  } catch (error) {
    console.error("Error finding admin user:", error.message);
  }
};

// Call the function to find the admin user
findAdminUser();

// Socket.IO Setup
io.on("connection", (socket) => {
  console.log("Connected to socket.io:", socket.id);

  // Setup user
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) {
      console.log("Invalid userData for setup:", userData);
      return;
    }
    socket.join(userData._id);
    socket.userId = userData._id;
    onlineUsers.add(userData._id);
    io.emit("getUsers", Array.from(onlineUsers));
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (room) => {
    if (!room) {
      console.log("Invalid room for join chat:", room);
      return;
    }
    socket.join(room);
  });

  // Handle typing events
  socket.on("typing", (room) => {
    if (!room) return;
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    if (!room) return;
    socket.in(room).emit("stop typing");
  });

  // Handle new message
  socket.on("new message", async (newMessageRecieved) => {
    console.log("New message event received:", newMessageRecieved);
    if (!newMessageRecieved || !newMessageRecieved.chat) {
      console.log("Invalid new message received:", newMessageRecieved);
      return;
    }

    const chat = newMessageRecieved.chat;

    if (!chat.users) {
      console.log("chat.users not defined:", chat);
      return;
    }
    const senderUser = await User.findById(newMessageRecieved.sender._id);
    newMessageRecieved.sender.name = senderUser ? senderUser.name : "Unknown";
    // Broadcast the message to all users in the chat
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
      console.log(`Message sent to user ${user._id}:`, newMessageRecieved.content);
    });

    // Check if the chat includes the admin and if the admin is offline
    try {
      const chatData = await Chat.findById(chat._id).populate("users");
      
      const isMessageForAdmin = chatData.users.some((u) => u._id.toString() === adminUserId);
      const isAdminOnline = onlineUsers.has(adminUserId);

      if (isMessageForAdmin && !isAdminOnline && adminUserId) {
        console.log("Admin offline, sending to Rasa:", newMessageRecieved.content);
        // Send message to Rasa bot
        const rasaResponse = await axios.post(
          "http://localhost:5005/webhooks/rest/webhook",
          {
            sender: newMessageRecieved.sender._id,
            message: newMessageRecieved.content,
          },
          { timeout: 5000 }
        );
        console.log("Rasa full response:", rasaResponse.data);
        const botResponse = rasaResponse.data[0]?.text || "I can only answer specific questions. Please try rephrasing your question.";
        console.log("Bot response text:", botResponse);

        const botUser = await User.findOne({ username: "ai-bot" });
      if (!botUser) throw new Error("Bot user not found in database");
        const botMessage = {
          _id: new mongoose.Types.ObjectId().toString(), // Generate a unique ID
          content: botResponse,
          chat: chat._id,
          sender: { _id: botUser._id.toString(), name: botUser.name }, // Ensure name is included
          createdAt: new Date().toISOString(),
        };

        const newBotMessage = new Message({
          sender: botUser._id,
          content: botResponse,
          chat: chat._id,
        });
        await newBotMessage.save();
        console.log("Bot message saved to DB:", botMessage);
        // Broadcast the bot's response
        chat.users.forEach((user) => {
         // if (user._id === newMessageRecieved.sender._id) return;
          socket.in(user._id).emit("message recieved", botMessage);
        });
        socket.in(newMessageRecieved.sender._id).emit("message recieved", botMessage);

        // Save the bot's message to the database
        
      }
    } catch (error) {
      console.error("Error in bot response:", error.message);
      const errorMessage = {
        _id: new mongoose.Types.ObjectId().toString(),
        content: "Sorry, the AI assistant is currently unavailable.",
        chat: chat,
        sender: { _id: "ai-bot", name: "AI Assistant" },
        createdAt: new Date().toISOString(),
      };
      chat.users.forEach((user) => {
        socket.in(user._id).emit("message recieved", errorMessage);
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("getUsers", Array.from(onlineUsers));
    }
    console.log("User disconnected:", socket.id);
  });
});


// Existing endpoints
app.get('/', (req, res) => {
  res.send("API IS RUNNING successfully");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
