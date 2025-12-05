# Authentication Integration Guide

## ✅ What's Been Implemented

### 1. **Auth Services Running**
- Auth service: `http://localhost:3001`
- User service: `http://localhost:3002`
- PostgreSQL (auth): `localhost:5433`
- Redis (auth): `localhost:6380`

### 2. **Frontend Integration**
- Real login/register forms in `LoginPage.tsx`
- JWT token storage in localStorage
- Protected routes requiring authentication
- Auto-redirect to login if not authenticated
- User info loaded from JWT after login

### 3. **Backend Integration**
- JWT middleware protecting all conversation and message APIs
- User ID extracted from JWT token (no more hardcoded IDs)
- Auth validation on every API request

### 4. **Security**
- JWT tokens required for all protected routes
- Token expires in 15 minutes (access token)
- Refresh token valid for 7 days
- Passwords hashed with bcrypt

## 🚀 How to Test

### Step 1: Ensure All Services Are Running

```bash
# Main chat services (should already be running)
cd "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zalo-clone"
docker-compose ps  # Check MongoDB, PostgreSQL, Redis

# Auth services (should already be running)
cd src/auth-user-monorepo
docker-compose ps  # Check auth-service, user-service, postgres, redis

# Backend server (if not running)
npm run dev

# Frontend (if not running)
cd src/client/webapp
npm run dev
```

### Step 2: Register a New User

1. Open browser: `http://localhost:3000`
2. Click "Đăng ký" tab
3. Fill in:
   - Email: `your-email@example.com`
   - Password: `Test123!@#` (must be strong)
   - Username: `yourusername`
   - Display Name: `Your Name`
4. Click "Đăng ký"

**Note:** Email verification is required. To bypass in development:

```powershell
docker exec -it auth-user-monorepo-postgres-1 psql -U zalo_auth_user -d zalo_auth_db -c "UPDATE users SET is_verified = true WHERE email = 'your-email@example.com';"
```

### Step 3: Login

1. Click "Đăng nhập" tab
2. Enter your email and password
3. Click "Đăng nhập"
4. You should be redirected to `/app/chats`

### Step 4: Verify Authentication

**Check Browser Console:**
```javascript
// Should see your JWT token
localStorage.getItem('accessToken')

// Should see your user info
localStorage.getItem('user')
```

**Check Network Tab:**
- All API requests to `/api/conversations` and `/api/messages` should include:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### Step 5: Test Protected Routes

1. **Try accessing chat without login:**
   - Clear localStorage: `localStorage.clear()`
   - Navigate to `http://localhost:3000/app/chats`
   - Should redirect to `/login`

2. **Login and access chat:**
   - Login successfully
   - Navigate to `/app/chats`
   - Should see chat interface with your conversations

## 🔑 API Endpoints

### Auth Service (port 3001)

```bash
# Register
POST http://localhost:3001/auth/register
Body: {
  "email": "user@example.com",
  "password": "Test123!@#",
  "username": "username",
  "displayName": "Display Name"
}

# Login
POST http://localhost:3001/auth/login
Body: {
  "email": "user@example.com",
  "password": "Test123!@#"
}
Response: {
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer"
}

# Logout
POST http://localhost:3001/auth/logout
Body: {
  "refreshToken": "eyJhbGci..."
}

# Refresh Token
POST http://localhost:3001/auth/refresh
Body: {
  "refreshToken": "eyJhbGci..."
}
```

### Chat API (port 5000) - Now Protected

```bash
# Get Conversations (requires JWT)
GET http://localhost:5000/api/conversations
Headers: {
  "Authorization": "Bearer eyJhbGci..."
}

# Send Message (requires JWT)
POST http://localhost:5000/api/messages
Headers: {
  "Authorization": "Bearer eyJhbGci..."
}
Body: {
  "conversationId": "...",
  "content": "Hello!"
}
```

## 🛠️ Troubleshooting

### Issue: "Missing or invalid Authorization header"
**Solution:** Make sure you're logged in and localStorage has `accessToken`

### Issue: "Invalid or expired token"
**Solutions:**
1. Token expired (15 min) - login again
2. JWT_SECRET mismatch - check `.env` files match
3. Clear localStorage and login again

### Issue: "Account not verified"
**Solution:** Run the SQL command to verify the account:
```powershell
docker exec -it auth-user-monorepo-postgres-1 psql -U zalo_auth_user -d zalo_auth_db -c "UPDATE users SET is_verified = true WHERE email = 'your-email@example.com';"
```

### Issue: Can't access chat after login
**Solution:**
1. Check browser console for errors
2. Verify token is stored: `localStorage.getItem('accessToken')`
3. Check Network tab for failed API calls
4. Ensure backend server is running on port 5000

### Issue: Auth services not running
**Solution:**
```powershell
cd "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zalo-clone\src\auth-user-monorepo"
docker-compose up -d
docker-compose ps  # Verify all services are running
```

## 📝 Important Notes

1. **JWT Secret Must Match:**
   - Main `.env`: `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024`
   - Auth `.env`: `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024`

2. **No More Hardcoded User IDs:**
   - Old: User ID was `"674612345678901234567890"`
   - New: User ID comes from JWT token after login

3. **Token Refresh:**
   - Access token expires in 15 minutes
   - Use refresh token to get new access token
   - Frontend doesn't implement auto-refresh yet (TODO)

4. **CORS Configuration:**
   - Auth service allows: `http://localhost:3000,http://localhost:5000`
   - Main server allows: `http://localhost:3000`

## ✨ Next Steps (Optional Improvements)

1. **Auto Token Refresh:** Implement automatic token refresh before expiration
2. **Socket.IO Auth:** Add JWT authentication to WebSocket connections
3. **Email Service:** Configure real email for verification (currently mock)
4. **Remember Me:** Add persistent login option
5. **Logout Button:** Add logout functionality in UI
6. **User Profile:** Display logged-in user info in header

## 🎉 Success Criteria

Your authentication is working if:
- ✅ You can register a new user
- ✅ You can login with email/password
- ✅ You're redirected to `/app/chats` after login
- ✅ API requests include `Authorization: Bearer <token>` header
- ✅ You're redirected to `/login` when accessing protected routes without token
- ✅ Backend validates JWT and returns conversations for authenticated user
