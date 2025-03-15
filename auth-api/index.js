const express = require('express');
const mongoose = require('mongoose');
const http = require("http");
const cors = require('cors');
const session = require('express-session');
const { GoogleAuth } = require('google-auth-library');
const authRoutes = require('./routes/authRoutes');  
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);

// -------------------- Middleware Setup --------------------

// Parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to allow credentials from your client
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // This sets 'Access-Control-Allow-Credentials' to true
}));

// Configure sessions (use a secure secret in production)
app.use(session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: true,
}));

// Initialize Socket.IO with proper CORS settings
const io = require("socket.io")(server, {
  cors: { 
    origin: "http://localhost:5173", 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    credentials: true // This ensures that credentials are allowed
  }
});

// Make the Socket.IO instance available in your Express app
app.set("socketio", io);

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // Listen for custom event "newPost"
  socket.on("newPost", (data) => {
    console.log("Received newPost event:", data);
    // Broadcast to all clients
    io.emit("newPost", data);
  });
  
  // Listen for custom event "voteUpdate"
  socket.on("voteUpdate", (data) => {
    console.log("Received voteUpdate event:", data);
    io.emit("voteUpdate", data);
  });
  
  // Additional event listeners can be added here
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// -------------------- MongoDB Connection --------------------

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// -------------------- Routes --------------------

app.use('/auth', authRoutes); 
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/users', userRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/admin', adminRoutes);
app.use('/moderation', moderationRoutes);
app.use('/search', searchRoutes);

// -------------------- Start Server --------------------

const PORT = process.env.PORT || 5009;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
