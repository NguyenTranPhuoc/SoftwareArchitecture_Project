# Deployment Fix - Chat Persistence & GCS Uploads

## Issues Fixed
1. **Image/video/file upload 500 errors** - Missing GCS environment variables in Docker
2. **Chat history lost on refresh** - Frontend never loaded messages from MongoDB API

## Changes Made

### Backend Configuration (docker-compose.prod.yml)
- Added GCS environment variables to backend service:
  - `GCS_PROJECT_ID=zola-478416`
  - `GCS_BUCKET_NAME=zola-uploads-2470576`
  - `GCS_KEY_FILE=/app/config/zola-478416-4990089e3062.json`
- Added volume mount for GCS credentials: `./GCS:/app/config:ro`

### Frontend Changes

#### 1. ChatsPage.tsx
- Added conversation loading from API on mount
- Calls `api.getConversations(userId)` when page loads
- Transforms and stores conversations in Zustand store
- Shows conversations from database instead of empty array

#### 2. ChatWindow.tsx  
- Added message loading from API when conversation is selected
- Calls `api.getMessages(conversationId)` on conversation change
- Loads up to 100 most recent messages from MongoDB
- Merges with real-time Socket.IO messages to avoid duplicates
- Now shows full chat history after page refresh

#### 3. chatStore.ts
- Added `setConversations()` method to update conversations array
- Added `setMessages()` method to update messages array
- Enables ChatsPage and ChatWindow to hydrate state from API

## Deployment Steps

### 1. SSH to VM
```bash
ssh user@34.124.227.173
cd ~/SoftwareArchitecture_Project
```

### 2. Pull Latest Code
```bash
git pull origin main
```

### 3. Verify GCS Key File Exists
```bash
ls -la GCS/
# Should show: zola-478416-4990089e3062.json
```

If missing, copy from local:
```bash
# On local machine:
scp F:\14_CaoHoc\Ky2\Kiến\ trúc\ phần\ mềm\Zola2\GCS\zola-478416-4990089e3062.json user@34.124.227.173:~/SoftwareArchitecture_Project/GCS/
```

### 4. Rebuild and Restart
```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Rebuild backend (includes new env vars)
docker compose -f docker-compose.prod.yml build backend

# Rebuild frontend (includes new API calls)
docker compose -f docker-compose.prod.yml build frontend

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### 5. Verify Environment Variables
```bash
docker compose -f docker-compose.prod.yml exec backend env | grep GCS
```

Should show:
```
GCS_PROJECT_ID=zola-478416
GCS_BUCKET_NAME=zola-uploads-2470576
GCS_KEY_FILE=/app/config/zola-478416-4990089e3062.json
```

### 6. Verify Key File in Container
```bash
docker compose -f docker-compose.prod.yml exec backend ls -la /app/config/
```

Should show: `zola-478416-4990089e3062.json`

## Testing

### Test 1: Message Persistence
1. Open chat at http://34.124.227.173:3000
2. Login with your account
3. Send messages to a friend
4. Refresh page (Ctrl+R)
5. ✅ Messages should still be visible

### Test 2: Image Upload
1. Click image button in chat window
2. Select an image file
3. ✅ Image should upload and display
4. ✅ Check GCS bucket: https://console.cloud.google.com/storage/browser/zola-uploads-2470576/chat-images
5. ✅ File should appear in bucket

### Test 3: Video Upload
1. Click video button in chat window
2. Select a video file (MP4, max 50MB)
3. ✅ Video should upload with play button
4. ✅ Check GCS bucket for video file

### Test 4: File Upload
1. Click file button in chat window
2. Select any file (PDF, DOC, etc., max 100MB)
3. ✅ File should upload as downloadable link
4. ✅ Check GCS bucket for file

### Test 5: Conversation Loading
1. Create conversations with multiple friends
2. Refresh page
3. ✅ All conversations should appear in left sidebar
4. ✅ Can navigate between conversations

## Troubleshooting

### If uploads still fail with 500:
```bash
# Check backend logs for GCS errors
docker compose -f docker-compose.prod.yml logs backend | grep -i gcs

# Verify GCS credentials are valid
docker compose -f docker-compose.prod.yml exec backend cat /app/config/zola-478416-4990089e3062.json

# Test GCS connectivity
docker compose -f docker-compose.prod.yml exec backend curl https://storage.googleapis.com
```

### If messages don't load:
```bash
# Check frontend console for errors
# Open browser DevTools -> Console

# Check MongoDB has messages
docker compose -f docker-compose.prod.yml exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
use zalo_chat
db.messages.countDocuments()
db.conversations.countDocuments()

# Check backend API is working
curl http://localhost:6000/api/conversations?userId=YOUR_USER_ID
curl http://localhost:6000/api/messages/CONVERSATION_ID
```

### If conversations don't load:
```bash
# Check network tab in browser DevTools
# Should see requests to:
# GET /api/conversations?userId=...
# GET /api/messages/...

# Check backend routes are registered
docker compose -f docker-compose.prod.yml exec backend grep -r "app.use.*conversations" /app/server.ts
```

## Rollback Plan
If issues occur after deployment:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback Docker containers
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Expected Results After Deployment
- ✅ Image uploads work correctly
- ✅ Video uploads work correctly  
- ✅ File uploads work correctly
- ✅ Chat history persists after page refresh
- ✅ Conversations load from database on app startup
- ✅ New messages appear in real-time via Socket.IO
- ✅ All files stored in GCS bucket with public URLs

## Notes
- GCS key file mounted as read-only for security
- Messages load limit: 100 most recent per conversation
- Upload limits: 50MB for images/videos, 100MB for files
- All uploaded files are automatically made public
- Files stored in `chat-images/` folder in GCS bucket
