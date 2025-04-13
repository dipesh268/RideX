
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth.cjs');
const rideRoutes = require('./routes/rides.cjs');
const userRoutes = require('./routes/users.cjs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:'http://localhost:5173' || 'http://192.168.23.95:5173',
    methods: ["POST"],
    credentials: true
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  // Join driver room when they come online
  socket.on('driver:online', (driverData) => {
    const { driverId, vehicleType } = driverData;
    socket.join(`driver:${driverId}`);
    socket.join(`driver-type:${vehicleType}`);
    console.log(`Driver ${driverId} is online with vehicle type: ${vehicleType}`);
  });
  
  // Leave driver room when they go offline
  socket.on('driver:offline', (driverData) => {
    const { driverId, vehicleType } = driverData;
    socket.leave(`driver:${driverId}`);
    socket.leave(`driver-type:${vehicleType}`);
    console.log(`Driver ${driverId} is offline`);
  });
  
  // Handle new ride requests
  socket.on('ride:request', (rideData) => {
    // Broadcast to all drivers of the specific type that are online
    io.to(`driver-type:${rideData.vehicleType}`).emit('ride:available', rideData);
    console.log(`New ride request broadcasted to ${rideData.vehicleType} drivers`);
  });
  
  // Handle ride acceptance
  socket.on('ride:accepted', (data) => {
    io.to(`rider:${data.riderId}`).emit('ride:accepted', data);
    console.log(`Ride accepted by driver ${data.driverId} for rider ${data.riderId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Middleware
app.use(express.json());
app.use(cors({
  origin:'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ridex')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Make io accessible to route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('RideX API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
