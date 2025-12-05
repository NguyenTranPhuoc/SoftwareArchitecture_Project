# Member 4 Tasks - Backend Developer (Chat & Messaging)

## 💬 Your Role
You are responsible for building the **Chat & Messaging Backend**. This includes real-time messaging with WebSockets, storing messages, managing conversations, and handling file sharing.

**Estimated Time**: 50 hours over 3 weeks  
**Complexity**: High  
**Primary Skills Needed**: Node.js, Socket.io, MongoDB, WebSockets

---

## 📅 Week 1: Setup & WebSocket Foundation (18 hours)

### Day 1-2: Project Setup (6 hours)
- [ ] Install Node.js packages:
  ```bash
  npm install socket.io
  npm install mongodb @types/mongodb
  npm install express-validator
  npm install redis @types/redis  # For session management
  ```
- [ ] Create folder structure:
  ```
  src/
  ├── socket/
  │   ├── handlers/
  │   └── events.ts
  ├── controllers/
  │   └── messageController.ts
  └── models/
      └── Message.ts
  ```
- [ ] Setup MongoDB connection (work with Member 5)
- [ ] Test MongoDB connection

### Day 3-5: WebSocket Server Setup (6 hours)
- [ ] Create Socket.io server in `server.ts`:
  ```typescript
  import { Server } from 'socket.io';
  import http from 'http';
  
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:19006'],
      credentials: true
    }
  });
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
  });
  
  httpServer.listen(5000);
  ```
- [ ] Create authentication middleware for Socket.io
- [ ] Test WebSocket connection from browser
- [ ] Setup Redis for managing online users

### Day 6-7: Basic Messaging (6 hours)
- [ ] Create MongoDB schema for messages:
  ```typescript
  interface Message {
    _id: ObjectId;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
  }
  ```
- [ ] Implement send message event handler
- [ ] Store messages in MongoDB
- [ ] Emit message to recipient
- [ ] Test one-to-one messaging

**Week 1 Deliverable**: Working WebSocket server with basic messaging

---

## 📅 Week 2: Advanced Features (18 hours)

### Day 8-10: Conversation Management (8 hours)
- [ ] Create conversations collection in MongoDB:
  ```typescript
  interface Conversation {
    _id: ObjectId;
    type: 'private' | 'group';
    participants: string[];
    name?: string;  // For group chats
    created_by?: string;
    created_at: Date;
    last_message?: {
      content: string;
      timestamp: Date;
      sender_id: string;
    };
  }
  ```
- [ ] Create conversation endpoints:
  ```typescript
  POST /api/conversations
  // Create new conversation
  
  GET /api/conversations
  // Get all user's conversations
  
  GET /api/conversations/:id/messages
  // Get conversation messages (paginated)
  
  POST /api/conversations/:id/members
  // Add member to group (group chat only)
  ```
- [ ] Implement message history retrieval
- [ ] Test with Postman

### Day 11-14: Real-time Features (10 hours)
- [ ] Implement typing indicator:
  ```typescript
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user_typing', { userId });
  });
  
  socket.on('stop_typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user_stop_typing', { userId });
  });
  ```
- [ ] Implement online status:
  ```typescript
  // When user connects
  socket.on('user_online', async ({ userId }) => {
    await redis.set(`user:${userId}:status`, 'online');
    io.emit('user_status_change', { userId, status: 'online' });
  });
  ```
- [ ] Implement message delivery status:
  - Update to 'delivered' when received
  - Update to 'read' when user opens chat
- [ ] Implement read receipts
- [ ] Test all real-time features

**Week 2 Deliverable**: Complete real-time messaging with status updates

---

## 📅 Week 3: Group Chat & Polish (14 hours)

### Day 15-17: Group Chat (8 hours)
- [ ] Implement group chat creation:
  ```typescript
  POST /api/conversations/group
  Body: { name, participant_ids }
  ```
- [ ] Implement group message broadcasting:
  ```typescript
  socket.on('send_group_message', async (data) => {
    const { conversationId, content, senderId } = data;
    
    // Save to database
    const message = await saveMessage({ conversationId, content, senderId });
    
    // Get all participants
    const conversation = await getConversation(conversationId);
    
    // Broadcast to all participants
    conversation.participants.forEach(participantId => {
      io.to(`user:${participantId}`).emit('new_message', message);
    });
  });
  ```
- [ ] Add/remove group members endpoints
- [ ] Group admin permissions
- [ ] Test group messaging

### Day 18-19: File Sharing (4 hours)
- [ ] Create file message type
- [ ] Implement file metadata storage:
  ```typescript
  interface FileMessage extends Message {
    message_type: 'image' | 'file';
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
  }
  ```
- [ ] Work with Member 5 for file upload to Google Cloud Storage
- [ ] Send file URL via WebSocket
- [ ] Test image and file sharing

### Day 20-21: Integration & Testing (2 hours)
- [ ] Test with Member 1 (Web app)
- [ ] Test with Member 2 (Mobile app)
- [ ] Fix reported bugs
- [ ] Optimize message queries (add indexes)
- [ ] Add error handling
- [ ] Complete documentation

**Week 3 Deliverable**: Production-ready chat system

---

## 📦 Features Checklist

### WebSocket Events (10 events):
- [ ] `connection` - User connects
- [ ] `disconnect` - User disconnects
- [ ] `send_message` - Send private message
- [ ] `send_group_message` - Send group message
- [ ] `typing` - User is typing
- [ ] `stop_typing` - User stopped typing
- [ ] `message_delivered` - Mark as delivered
- [ ] `message_read` - Mark as read
- [ ] `user_online` - User comes online
- [ ] `user_offline` - User goes offline

### REST API Endpoints (7 endpoints):
- [ ] POST `/api/conversations` - Create conversation
- [ ] GET `/api/conversations` - Get all conversations
- [ ] GET `/api/conversations/:id` - Get conversation details
- [ ] GET `/api/conversations/:id/messages` - Get messages (paginated)
- [ ] POST `/api/conversations/group` - Create group chat
- [ ] POST `/api/conversations/:id/members` - Add member to group
- [ ] DELETE `/api/conversations/:id/members/:userId` - Remove member

### Database Collections (2 collections):
- [ ] `conversations` - Chat conversations
- [ ] `messages` - All messages

---

## 🛠️ Required Skills & Learning

### Essential:
- ✅ Node.js basics
- ✅ JavaScript/TypeScript
- ✅ Basic database concepts

### Need to learn:
- 📚 Socket.io for WebSockets
- 📚 MongoDB queries
- 📚 Redis for caching
- 📚 Real-time communication patterns
- 📚 Event-driven programming

### Learning Resources:
- Socket.io docs: https://socket.io/docs
- MongoDB tutorial: https://www.mongodb.com/docs/manual
- Redis guide: https://redis.io/docs

---

## 🤝 Collaboration Points

### With Member 3 (Auth Backend):
- Use their authentication middleware
- Share Express server setup
- Use same error handling patterns

### With Member 5 (DevOps):
- Get MongoDB connection details
- Setup Redis for sessions
- Configure Google Cloud Storage for files

### With Member 1 & 2 (Frontend):
- Provide WebSocket event documentation
- Help with Socket.io client setup
- Test real-time features together
- Fix bugs they report

---

## ✅ Daily Checklist

### Every Day:
- [ ] Pull latest code
- [ ] Start MongoDB and Redis
- [ ] Start backend server
- [ ] Test WebSocket connection
- [ ] Work on tasks
- [ ] Commit and push
- [ ] Update documentation

### Testing Checklist:
- [ ] Test with Socket.io client tester
- [ ] Test message sending
- [ ] Test message receiving
- [ ] Test typing indicators
- [ ] Test online status
- [ ] Check database for saved messages

---

## 📝 Code Examples

### Example: Socket.io Server Setup
```typescript
// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:19006'],
    credentials: true
  }
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.data.userId);
  
  // Join user's personal room
  socket.join(`user:${socket.data.userId}`);
  
  // Handle events
  socket.on('send_message', handleSendMessage);
  socket.on('typing', handleTyping);
  socket.on('disconnect', handleDisconnect);
});

httpServer.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### Example: Send Message Handler
```typescript
// socket/handlers/messageHandler.ts
import { Socket } from 'socket.io';
import { messagesCollection } from '../database';

export const handleSendMessage = async (
  socket: Socket,
  data: { conversationId: string; content: string }
) => {
  try {
    const { conversationId, content } = data;
    const senderId = socket.data.userId;
    
    // Create message object
    const message = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: 'text',
      timestamp: new Date(),
      status: 'sent'
    };
    
    // Save to MongoDB
    const result = await messagesCollection.insertOne(message);
    const savedMessage = { ...message, _id: result.insertedId };
    
    // Get conversation participants
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId)
    });
    
    // Send to all participants except sender
    conversation?.participants.forEach(participantId => {
      if (participantId !== senderId) {
        socket.to(`user:${participantId}`).emit('new_message', savedMessage);
      }
    });
    
    // Confirm to sender
    socket.emit('message_sent', savedMessage);
    
  } catch (error) {
    socket.emit('error', { message: 'Failed to send message' });
  }
};
```

### Example: Typing Indicator
```typescript
export const handleTyping = (
  socket: Socket,
  data: { conversationId: string }
) => {
  const { conversationId } = data;
  const userId = socket.data.userId;
  
  // Broadcast to conversation members
  socket.to(conversationId).emit('user_typing', {
    conversationId,
    userId
  });
};
```

### Example: Get Messages API
```typescript
// controllers/messageController.ts
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await messagesCollection
      .find({ conversation_id: conversationId })
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();
    
    res.json({
      messages: messages.reverse(),
      page: Number(page),
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
```

---

## 🐛 Common Issues & Solutions

### Issue: "WebSocket connection fails"
**Solution**: Check CORS settings, ensure frontend sends auth token

### Issue: "Messages not saving to MongoDB"
**Solution**: Verify MongoDB connection, check collection name

### Issue: "User not receiving messages"
**Solution**: Ensure user joined their room (`user:${userId}`), check socket connection

### Issue: "Typing indicator not showing"
**Solution**: Make sure users joined conversation room, check event names match

### Issue: "High latency in messages"
**Solution**: Add indexes to MongoDB, optimize queries, check network

---

## 🧪 Testing WebSocket Events

### Using Socket.io Client Test:
```html
<!-- test.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <script>
    const socket = io('http://localhost:5000', {
      auth: {
        token: 'YOUR_JWT_TOKEN'
      }
    });
    
    socket.on('connect', () => {
      console.log('Connected!');
      
      // Send test message
      socket.emit('send_message', {
        conversationId: 'test-conv-123',
        content: 'Hello!'
      });
    });
    
    socket.on('new_message', (message) => {
      console.log('Received:', message);
    });
    
    socket.on('user_typing', (data) => {
      console.log('User typing:', data);
    });
  </script>
</body>
</html>
```

### Testing with Postman:
```
GET http://localhost:5000/api/conversations
Headers: Authorization: Bearer <token>

GET http://localhost:5000/api/conversations/:id/messages?page=1&limit=50
Headers: Authorization: Bearer <token>

POST http://localhost:5000/api/conversations
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "participant_ids": ["user-id-1", "user-id-2"]
}
```

---

## 📊 MongoDB Indexes (Important!)

Add these indexes for better performance:
```javascript
// In MongoDB shell or migration script
db.messages.createIndex({ conversation_id: 1, timestamp: -1 });
db.messages.createIndex({ sender_id: 1 });
db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ 'last_message.timestamp': -1 });
```

---

## 🎯 Success Criteria

By the end of 3 weeks:
- [ ] WebSocket server running stable
- [ ] One-to-one messaging works
- [ ] Group chat works
- [ ] Typing indicators work
- [ ] Online status works
- [ ] Message history loads correctly
- [ ] Files can be shared
- [ ] Integrated with frontend apps
- [ ] All code documented
- [ ] No major bugs

---

## 📊 Progress Tracking

**Week 1**: ___% complete  
**Week 2**: ___% complete  
**Week 3**: ___% complete  

---

**Your Role**: Backend - Chat & Messaging  
**Time Commitment**: ~50 hours  
**Primary Technology**: Socket.io, MongoDB, Node.js  
**Complexity**: High (Real-time systems)  
**Status**: Ready to Start! 🚀