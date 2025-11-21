# Chat Media Upload - Zalo-Style Image/Video Sharing

## Overview
This feature allows users to upload images and videos in chat messages, just like Zalo. Files are stored in Google Cloud Storage and return public URLs that can be shared in chat messages.

## API Endpoints

### 1. Upload Single Image
**Endpoint:** `POST /api/chat/image`

Upload a single image to send in a chat message.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `image`
- Max size: 10MB
- Allowed types: `image/*` (jpg, png, gif, etc.)

**Example (cURL):**
```bash
curl -X POST http://34.124.227.173:5000/api/chat/image \
  -F "image=@/path/to/photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1732320123456-photo.jpg",
  "thumbnail": "https://storage.googleapis.com/...",
  "metadata": {
    "filename": "photo.jpg",
    "size": 245678,
    "mimetype": "image/jpeg",
    "uploadedAt": "2025-11-22T10:30:00.000Z"
  }
}
```

### 2. Upload Multiple Images
**Endpoint:** `POST /api/chat/images`

Upload up to 10 images at once (for photo albums in chat).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `images` (multiple files)
- Max files: 10
- Max size per file: 10MB
- Allowed types: `image/*`

**Example (cURL):**
```bash
curl -X POST http://34.124.227.173:5000/api/chat/images \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "images=@photo3.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "images": [
    {
      "url": "https://storage.googleapis.com/.../photo1.jpg",
      "thumbnail": "https://storage.googleapis.com/.../photo1.jpg",
      "filename": "photo1.jpg",
      "size": 123456,
      "mimetype": "image/jpeg"
    },
    // ... more images
  ]
}
```

### 3. Upload Video
**Endpoint:** `POST /api/chat/video`

Upload a video to send in a chat message.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `video`
- Max size: 10MB
- Allowed types: `video/*` (mp4, webm, etc.)

**Example (cURL):**
```bash
curl -X POST http://34.124.227.173:5000/api/chat/video \
  -F "video=@/path/to/video.mp4"
```

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "videoUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1732320234567-video.mp4",
  "metadata": {
    "filename": "video.mp4",
    "size": 5678901,
    "mimetype": "video/mp4",
    "duration": null,
    "uploadedAt": "2025-11-22T10:35:00.000Z"
  }
}
```

### 4. API Info
**Endpoint:** `GET /api/chat/info`

Get information about the chat upload API.

**Example:**
```bash
curl http://34.124.227.173:5000/api/chat/info
```

## How to Use in Chat Application

### Flow for Sending Image Messages:

1. **User selects image** from their device
2. **Frontend uploads** the image to `/api/chat/image`
3. **Backend returns** the GCS public URL
4. **Frontend sends** chat message via Socket.IO with the URL:
```javascript
socket.emit('send-message', {
  type: 'image',
  content: 'Check this out!',
  imageUrl: 'https://storage.googleapis.com/...',
  timestamp: Date.now()
});
```
5. **Receiver displays** the image in their chat UI

### Example Frontend Integration:

```javascript
// Upload image when user selects file
async function handleImageSelect(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('http://34.124.227.173:5000/api/chat/image', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Send message with image URL via Socket.IO
      socket.emit('send-message', {
        conversationId: currentConversationId,
        type: 'image',
        content: '',  // Optional caption
        imageUrl: data.imageUrl,
        thumbnail: data.thumbnail
      });
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Example Chat Message Structure:

```javascript
// Text message
{
  id: 'msg123',
  type: 'text',
  content: 'Hello!',
  senderId: 'user1',
  timestamp: 1732320000000
}

// Image message
{
  id: 'msg124',
  type: 'image',
  content: 'Check this out!',  // Optional caption
  imageUrl: 'https://storage.googleapis.com/.../photo.jpg',
  thumbnail: 'https://storage.googleapis.com/.../photo.jpg',
  senderId: 'user1',
  timestamp: 1732320100000
}

// Video message
{
  id: 'msg125',
  type: 'video',
  content: '',
  videoUrl: 'https://storage.googleapis.com/.../video.mp4',
  senderId: 'user1',
  timestamp: 1732320200000
}

// Multiple images (album)
{
  id: 'msg126',
  type: 'album',
  content: 'Here are some photos',
  images: [
    { url: 'https://...', thumbnail: 'https://...' },
    { url: 'https://...', thumbnail: 'https://...' }
  ],
  senderId: 'user1',
  timestamp: 1732320300000
}
```

## Testing

### Option 1: HTML Test Page
Open `chat-upload-test.html` in your browser. This provides a user-friendly interface to test all upload endpoints.

### Option 2: cURL Commands
```bash
# Test single image
curl -X POST http://34.124.227.173:5000/api/chat/image \
  -F "image=@test.jpg"

# Test multiple images
curl -X POST http://34.124.227.173:5000/api/chat/images \
  -F "images=@test1.jpg" \
  -F "images=@test2.jpg"

# Test video
curl -X POST http://34.124.227.173:5000/api/chat/video \
  -F "video=@test.mp4"

# Get API info
curl http://34.124.227.173:5000/api/chat/info
```

### Option 3: Postman
1. Create new request: `POST http://34.124.227.173:5000/api/chat/image`
2. Select Body → form-data
3. Add key: `image`, type: File
4. Choose file from your computer
5. Send request

## Deployment Steps

On your GCP VM, run these commands:

```bash
# Navigate to project directory
cd ~/SoftwareArchitecture_Project

# Pull latest code
git pull origin main

# Install any new dependencies (if needed)
npm install

# Rebuild TypeScript
npm run build:server

# Restart server
pm2 restart zola-backend

# Check logs
pm2 logs zola-backend --lines 20
```

## Verify Deployment

After deployment, test the endpoints:

```bash
# Check API info
curl http://34.124.227.173:5000/api/chat/info

# Should return API documentation
```

## Storage Location

All chat media files are stored in:
- **GCS Bucket:** `zola-uploads-2470576`
- **Folder:** `chat-images/`
- **Public Access:** Yes (files are publicly accessible via URL)
- **Naming:** `{timestamp}-{originalFilename}`

## File Size Limits

- **Images:** 10MB per file
- **Videos:** 10MB per file
- **Multiple images:** Up to 10 files per request

## Security Notes

⚠️ **Current Implementation (Demo/Testing):**
- No authentication required
- All files are public
- No user ownership tracking

✅ **Production Recommendations:**
- Add JWT authentication to upload endpoints
- Associate uploads with user IDs
- Implement file scanning for malware
- Add rate limiting to prevent abuse
- Generate actual thumbnails for images
- Extract video duration metadata
- Implement file cleanup for old uploads

## Next Steps for Backend Team

1. **Socket.IO Integration:**
   - Handle `send-message` events with image URLs
   - Broadcast messages to conversation participants
   - Store message records in MongoDB

2. **Database Schema:**
```javascript
// Message model
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  type: 'text' | 'image' | 'video' | 'album',
  content: String,  // Text or caption
  imageUrl: String,  // For type: image
  videoUrl: String,  // For type: video
  images: [{ url: String, thumbnail: String }],  // For type: album
  timestamp: Date,
  read: [ObjectId]  // Users who read this message
}
```

3. **Real-time Features:**
   - Upload progress indicators
   - Image compression before upload
   - Thumbnail generation
   - Video processing

## Support

For issues or questions:
- Check GCP bucket: https://console.cloud.google.com/storage/browser/zola-uploads-2470576
- Check server logs: `pm2 logs zola-backend`
- Test endpoints: Use `chat-upload-test.html`
