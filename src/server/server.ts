import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {
  testDatabaseConnections,
  closeDatabaseConnections,
  connectMongoDB,
  connectRedis,
} from './utils/database';
import uploadRoutes from './routes/upload';
import chatRoutes from './routes/chat';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Zola Clone API v1.0 - GCP File Storage Demo',
    endpoints: {
      health: '/health',
      upload: '/api/upload/* - GCP file upload endpoints',
      auth: '/api/auth/* (coming soon)',
      users: '/api/users/* (coming soon)',
      friends: '/api/friends/* (coming soon)',
      conversations: '/api/conversations/* (coming soon)',
      messages: '/api/messages/* (coming soon)',
    },
  });
});

// GCP Upload routes
app.use('/api/upload', uploadRoutes);

// Chat media upload routes
app.use('/api/chat', chatRoutes);

// TODO: Import and use route handlers
// import authRoutes from './routes/auth';
// import userRoutes from './routes/users';
// import friendRoutes from './routes/friends';
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/friends', friendRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✓ User connected:', socket.id);

  // TODO: Implement socket event handlers
  socket.on('disconnect', () => {
    console.log('✗ User disconnected:', socket.id);
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize databases and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Zalo Clone Server...\n');

    // Test database connections
    await testDatabaseConnections();

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`\n✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⚠ SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('✓ HTTP server closed');
    await closeDatabaseConnections();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n⚠ SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('✓ HTTP server closed');
    await closeDatabaseConnections();
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };