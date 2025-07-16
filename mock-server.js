import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let users = [
  { _id: '1', name: 'Alice Johnson', email: 'alice@example.com', profile: '' },
  { _id: '2', name: 'Bob Smith', email: 'bob@example.com', profile: '' },
  { _id: '3', name: 'Charlie Brown', email: 'charlie@example.com', profile: '' },
  { _id: '4', name: 'Diana Prince', email: 'diana@example.com', profile: '' },
  { _id: '5', name: 'Eve Wilson', email: 'eve@example.com', profile: '' },
  { _id: '6', name: 'Frank Miller', email: 'frank@example.com', profile: '' },
  { _id: '7', name: 'Grace Lee', email: 'grace@example.com', profile: '' },
  { _id: '8', name: 'Henry Davis', email: 'henry@example.com', profile: '' },
];

let messages = [];
let onlineUsers = ['1', '2', '3', '4', '5'];
let currentUser = null;

// Helper functions
const generateMessageId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Routes
app.post('/api/auth/login', (req, res) => {
  const { name, password } = req.body;
  
  // Simple mock authentication
  if (name && password) {
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    
    if (!user) {
      // Create new user if not exists
      user = {
        _id: (users.length + 1).toString(),
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        profile: ''
      };
      users.push(user);
    }
    
    currentUser = user;
    
    // Add to online users if not already there
    if (!onlineUsers.includes(user._id)) {
      onlineUsers.push(user._id);
    }
    
    res.json({
      success: true,
      user,
      token: 'mock-jwt-token',
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Name and password are required'
    });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, profile, fullName } = req.body;
  
  if (name && email && password && fullName) {
    // Check if user exists
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = {
      _id: (users.length + 1).toString(),
      name,
      email,
      fullName,
      profile: profile || "",
    };

    users.push(newUser);
    currentUser = newUser;

    // Add to online users
    if (!onlineUsers.includes(newUser._id)) {
      onlineUsers.push(newUser._id);
    }

    res.json({
      success: true,
      user: newUser,
      token: "mock-jwt-token",
      message: "Signup successful",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Name, email, password, and full name are required",
    });
  }
});

app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile
    }))
  });
});

app.get('/api/messages/:recipientId', (req, res) => {
  const { recipientId } = req.params;
  
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  const conversationMessages = messages.filter(msg => 
    (msg.senderId === currentUser._id && msg.recipientId === recipientId) ||
    (msg.senderId === recipientId && msg.recipientId === currentUser._id)
  );
  
  res.json({
    success: true,
    messages: conversationMessages
  });
});

app.post('/api/messages', (req, res) => {
  const { recipientId, content } = req.body;
  
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  if (!content || !recipientId) {
    return res.status(400).json({
      success: false,
      message: 'Content and recipient are required'
    });
  }
  
  const message = {
    _id: generateMessageId(),
    senderId: currentUser._id,
    recipientId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  messages.push(message);
  
  // Emit to recipient if they're online
  io.emit('newMessage', message);
  
  res.json({
    success: true,
    message
  });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.userId = userId;
    socket.join(userId);
    
    // Add to online users
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
    
    // Broadcast online users
    io.emit('onlineUsers', onlineUsers);
    console.log('User joined:', userId, 'Online users:', onlineUsers);
  });
  
  socket.on('sendMessage', (data) => {
    const { recipientId, content } = data;
    
    if (!socket.userId) {
      return socket.emit('error', 'Not authenticated');
    }
    
    const message = {
      _id: generateMessageId(),
      senderId: socket.userId,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    messages.push(message);
    
    // Send to recipient
    socket.to(recipientId).emit('newMessage', message);
    
    // Send back to sender as confirmation
    socket.emit('messageConfirmed', message);
    
    console.log('Message sent:', message);
  });
  
  socket.on('typing', (data) => {
    const { recipientId, isTyping } = data;
    socket.to(recipientId).emit('userTyping', {
      userId: socket.userId,
      isTyping
    });
  });
  
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Remove from online users
      onlineUsers = onlineUsers.filter(id => id !== socket.userId);
      
      // Broadcast updated online users
      io.emit('onlineUsers', onlineUsers);
      
      console.log('User disconnected:', socket.userId, 'Online users:', onlineUsers);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/signup');
  console.log('  GET /api/users');
  console.log('  GET /api/messages/:recipientId');
  console.log('  POST /api/messages');
  console.log('');
  console.log('Socket.IO events:');
  console.log('  join, sendMessage, typing');
  console.log('');
  console.log('Test users available:');
  users.forEach(user => console.log(`  - ${user.name} (${user.email})`));
});
