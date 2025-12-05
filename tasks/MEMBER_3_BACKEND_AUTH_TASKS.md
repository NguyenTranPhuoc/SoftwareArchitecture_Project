# Member 3 Tasks - Backend Developer (Authentication & Users)

## 👤 Your Role
You are responsible for building the **Backend API** for Authentication and User Management. You'll create the APIs that allow users to register, login, manage profiles, and handle friendships.

**Estimated Time**: 50 hours over 3 weeks  
**Complexity**: Medium-High  
**Primary Skills Needed**: Node.js, Express, PostgreSQL, JWT

---

## 📅 Week 1: Setup & Authentication (18 hours)

### Day 1-2: Project Setup (6 hours)
- [ ] Install Node.js and create Express project:
  ```bash
  mkdir zalo-backend
  cd zalo-backend
  npm init -y
  npm install express typescript ts-node @types/node @types/express
  npm install dotenv cors bcrypt jsonwebtoken
  npm install pg @types/pg  # PostgreSQL
  ```
- [ ] Setup TypeScript configuration (`tsconfig.json`)
- [ ] Create folder structure:
  ```
  src/
  ├── controllers/
  ├── routes/
  ├── middleware/
  ├── models/
  ├── services/
  └── server.ts
  ```
- [ ] Create `.env` file for configuration
- [ ] Push to GitHub

### Day 3-5: Database Setup (6 hours)
- [ ] Work with Member 5 to connect to PostgreSQL
- [ ] Create database schema for users:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Create User model (`models/User.ts`)
- [ ] Test database connection

### Day 6-7: Authentication APIs (6 hours)
- [ ] Create auth controller (`controllers/authController.ts`)
- [ ] Implement registration endpoint:
  ```typescript
  POST /api/auth/register
  Body: { email, password, display_name, phone }
  Response: { message, userId }
  ```
- [ ] Hash passwords with bcrypt
- [ ] Implement login endpoint:
  ```typescript
  POST /api/auth/login
  Body: { email, password }
  Response: { token, user }
  ```
- [ ] Generate JWT tokens
- [ ] Create authentication middleware to verify tokens
- [ ] Test with Postman

**Week 1 Deliverable**: Working register and login APIs

---

## 📅 Week 2: User Management & Friends (18 hours)

### Day 8-10: User Profile APIs (8 hours)
- [ ] Create user controller (`controllers/userController.ts`)
- [ ] Implement profile endpoints:
  ```typescript
  GET /api/users/profile
  // Get current user's profile
  
  PUT /api/users/profile
  Body: { display_name, avatar_url }
  // Update profile
  
  GET /api/users/search?query=john
  // Search users by name or email
  
  GET /api/users/:userId
  // Get specific user profile
  ```
- [ ] Add authentication middleware to protect routes
- [ ] Test all endpoints with Postman

### Day 11-14: Friendship System (10 hours)
- [ ] Create friendships table in database:
  ```sql
  CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(id),
    user_id_2 UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Create friendship controller (`controllers/friendshipController.ts`)
- [ ] Implement friendship endpoints:
  ```typescript
  POST /api/friends/request
  Body: { friend_id }
  // Send friend request
  
  POST /api/friends/accept/:requestId
  // Accept friend request
  
  POST /api/friends/reject/:requestId
  // Reject friend request
  
  GET /api/friends
  // Get list of friends
  
  GET /api/friends/requests
  // Get pending friend requests
  
  DELETE /api/friends/:friendId
  // Remove friend
  ```
- [ ] Test with Postman
- [ ] Document all APIs in `API_DOCUMENTATION.md`

**Week 2 Deliverable**: Complete user and friendship management APIs

---

## 📅 Week 3: Integration & Polish (14 hours)

### Day 15-17: Frontend Integration Support (8 hours)
- [ ] Enable CORS for frontend access:
  ```typescript
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:19006'],
    credentials: true
  }));
  ```
- [ ] Test APIs with Member 1 (Web frontend)
- [ ] Test APIs with Member 2 (Mobile app)
- [ ] Fix any bugs reported by frontend team
- [ ] Add proper error handling and validation
- [ ] Add request logging

### Day 18-19: File Upload Support (4 hours)
- [ ] Install multer for file uploads:
  ```bash
  npm install multer @types/multer
  ```
- [ ] Create upload endpoint:
  ```typescript
  POST /api/upload/avatar
  // Upload profile picture
  ```
- [ ] Work with Member 5 to upload to Google Cloud Storage
- [ ] Return uploaded file URL
- [ ] Test avatar upload

### Day 20-21: Testing & Documentation (2 hours)
- [ ] Write unit tests for important functions
- [ ] Test all error cases
- [ ] Complete API documentation
- [ ] Add code comments
- [ ] Help with deployment (if needed)

**Week 3 Deliverable**: Production-ready authentication and user APIs

---

## 📦 API Endpoints Checklist

### Authentication (3 endpoints):
- [ ] POST `/api/auth/register` - Register new user
- [ ] POST `/api/auth/login` - Login user
- [ ] POST `/api/auth/logout` - Logout user (optional)

### User Management (4 endpoints):
- [ ] GET `/api/users/profile` - Get current user profile
- [ ] PUT `/api/users/profile` - Update profile
- [ ] GET `/api/users/search` - Search users
- [ ] GET `/api/users/:userId` - Get user by ID

### Friendship (6 endpoints):
- [ ] POST `/api/friends/request` - Send friend request
- [ ] POST `/api/friends/accept/:id` - Accept request
- [ ] POST `/api/friends/reject/:id` - Reject request
- [ ] GET `/api/friends` - Get friends list
- [ ] GET `/api/friends/requests` - Get pending requests
- [ ] DELETE `/api/friends/:id` - Remove friend

### File Upload (1 endpoint):
- [ ] POST `/api/upload/avatar` - Upload profile picture

**Total**: 14 endpoints

---

## 🛠️ Required Skills & Learning

### Essential:
- ✅ Node.js basics
- ✅ JavaScript/TypeScript
- ✅ Basic SQL

### Need to learn:
- 📚 Express.js framework
- 📚 JWT authentication
- 📚 Password hashing (bcrypt)
- 📚 PostgreSQL queries
- 📚 REST API design

### Learning Resources:
- Express docs: https://expressjs.com
- JWT: https://jwt.io
- PostgreSQL tutorial: https://www.postgresqltutorial.com

---

## 🤝 Collaboration Points

### With Member 4 (Chat Backend):
- Share database connection code
- Ensure consistent API structure
- Share authentication middleware

### With Member 5 (DevOps):
- Get database connection details
- Get Google Cloud Storage setup
- Deploy backend together

### With Member 1 & 2 (Frontend):
- Provide API documentation
- Help with API integration
- Fix bugs they report
- Test endpoints together

---

## ✅ Daily Checklist

### Every Day:
- [ ] Pull latest code
- [ ] Work on tasks
- [ ] Test with Postman
- [ ] Commit and push
- [ ] Update API documentation

### Before Starting:
- [ ] Check database is running
- [ ] Start backend server: `npm run dev`
- [ ] Open Postman for testing

### After Coding:
- [ ] Test endpoint with Postman
- [ ] Check database to verify data
- [ ] Add error handling
- [ ] Document the endpoint

---

## 📝 Code Examples

### Example: Register Endpoint
```typescript
// controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../database';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name, phone } = req.body;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, display_name, phone)
       VALUES ($1, $2, $3, $4) RETURNING id, email, display_name`,
      [email, password_hash, display_name, phone]
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};
```

### Example: Login Endpoint
```typescript
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};
```

---

## 🐛 Common Issues & Solutions

### Issue: "Database connection error"
**Solution**: Check .env file has correct DATABASE_URL, work with Member 5

### Issue: "JWT token invalid"
**Solution**: Ensure JWT_SECRET is set in .env, check token expiry

### Issue: "CORS error from frontend"
**Solution**: Add frontend URLs to CORS whitelist

### Issue: "Password not hashing"
**Solution**: Ensure bcrypt is installed and using await

---

## 🧪 Testing with Postman

### Register Test:
```
POST http://localhost:5000/api/auth/register
Headers: Content-Type: application/json
Body:
{
  "email": "test@example.com",
  "password": "password123",
  "display_name": "Test User",
  "phone": "+1234567890"
}
```

### Login Test:
```
POST http://localhost:5000/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Profile Test:
```
GET http://localhost:5000/api/users/profile
Headers: 
  Content-Type: application/json
  Authorization: Bearer <your-token-here>
```

---

## 📊 Progress Tracking

**Week 1**: ___% complete  
**Week 2**: ___% complete  
**Week 3**: ___% complete  

---

**Your Role**: Backend - Auth & Users  
**Time Commitment**: ~50 hours  
**Primary Technology**: Node.js, Express, PostgreSQL  
**Status**: Ready to Start! 🚀