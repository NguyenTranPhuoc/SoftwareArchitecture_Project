# Google Cloud Storage Upload API Documentation

## GCS Bucket Information

**Project ID:** `zola-478416`  
**Bucket Name:** `zola-uploads-2470576`  
**Bucket URL:** `https://storage.googleapis.com/zola-uploads-2470576/`  
**Region:** Auto (Google-managed)

## Backend Upload Endpoints

### Base URL
- **Production:** `http://34.124.227.173:3000/api/chat`
- **Local Development:** `http://localhost:6000/api/chat`

### Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

---

## 1. Upload Single Image

**Endpoint:** `POST /api/chat/image`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file) - Image file (JPEG, PNG, GIF, WebP)

**Size Limit:** 50MB

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_photo.jpg",
  "thumbnail": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_photo.jpg",
  "metadata": {
    "filename": "photo.jpg",
    "size": 1234567,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-12-06T08:00:00.000Z"
  }
}
```

**Example (Android - OkHttp):**
```kotlin
val client = OkHttpClient()
val file = File("/path/to/image.jpg")

val requestBody = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addFormDataPart(
        "image",
        file.name,
        file.asRequestBody("image/jpeg".toMediaType())
    )
    .build()

val request = Request.Builder()
    .url("http://34.124.227.173:3000/api/chat/image")
    .header("Authorization", "Bearer $accessToken")
    .post(requestBody)
    .build()

client.newCall(request).execute().use { response ->
    val jsonResponse = JSONObject(response.body?.string())
    val imageUrl = jsonResponse.getString("imageUrl")
}
```

---

## 2. Upload Multiple Images

**Endpoint:** `POST /api/chat/images`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `images` (files) - Up to 10 images

**Size Limit:** 50MB per image

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "imageUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_photo1.jpg",
      "thumbnail": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_photo1.jpg",
      "filename": "photo1.jpg"
    },
    {
      "imageUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000001_photo2.jpg",
      "thumbnail": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000001_photo2.jpg",
      "filename": "photo2.jpg"
    }
  ],
  "count": 2
}
```

---

## 3. Upload Video

**Endpoint:** `POST /api/chat/video`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `video` (file) - Video file (MP4, MOV, AVI, WebM)

**Size Limit:** 50MB

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_video.mp4",
  "metadata": {
    "filename": "video.mp4",
    "size": 25678901,
    "mimeType": "video/mp4",
    "duration": null,
    "uploadedAt": "2025-12-06T08:00:00.000Z"
  }
}
```

**Example (Android - Retrofit):**
```kotlin
interface ChatApi {
    @Multipart
    @POST("/api/chat/video")
    suspend fun uploadVideo(
        @Header("Authorization") token: String,
        @Part video: MultipartBody.Part
    ): UploadResponse
}

// Usage
val file = File("/path/to/video.mp4")
val requestFile = file.asRequestBody("video/mp4".toMediaType())
val videoPart = MultipartBody.Part.createFormData("video", file.name, requestFile)

val response = chatApi.uploadVideo("Bearer $accessToken", videoPart)
```

---

## 4. Upload General File

**Endpoint:** `POST /api/chat/file`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file) - Any file type (PDF, DOC, XLSX, ZIP, etc.)

**Size Limit:** 100MB

**Response:**
```json
{
  "success": true,
  "fileUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_document.pdf",
  "metadata": {
    "filename": "document.pdf",
    "size": 5678901,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-12-06T08:00:00.000Z"
  }
}
```

---

## After Upload: Send Message via Socket.IO

After successfully uploading a file to GCS, send the message through Socket.IO:

**Event:** `message:send`

**Payload:**
```json
{
  "conversationId": "674612345678901234abcde1",
  "senderId": "03c7203d-8080-463b-877e-52abeaa81c06",
  "content": "🖼️ Hình ảnh",
  "type": "image",
  "fileUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_photo.jpg",
  "fileName": "photo.jpg",
  "fileSize": 1234567,
  "thumbnailUrl": "https://storage.googleapis.com/zola-uploads-2470576/chat-images/1733472000000_photo.jpg"
}
```

**Message Types:**
- `image` - Image files
- `video` - Video files
- `file` - General files
- `text` - Plain text messages

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

**413 Payload Too Large:**
```json
{
  "success": false,
  "error": "File too large. Maximum size: 50MB"
}
```

**415 Unsupported Media Type:**
```json
{
  "success": false,
  "error": "Invalid file type. Allowed: image/jpeg, image/png, image/gif"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Upload failed",
  "details": "Error message"
}
```

---

## File Naming Convention

All uploaded files are stored with this naming pattern:
```
chat-images/{timestamp}_{original_filename}
```

Example: `chat-images/1733472000000_my_photo.jpg`

---

## GCS Bucket Structure

```
zola-uploads-2470576/
├── avatars/           # User profile pictures
├── chat-images/       # All chat media (images, videos, files)
└── test/             # Test uploads
```

---

## Important Notes for Android Development

1. **File Permissions:** All uploaded files are automatically made public. No authentication needed to view/download.

2. **File Access:** Files can be accessed directly via URL:
   ```
   https://storage.googleapis.com/zola-uploads-2470576/chat-images/FILENAME
   ```

3. **MIME Types:** Backend automatically detects MIME type. Ensure you set correct content type when uploading.

4. **Progress Tracking:** For large files, implement progress tracking:
   ```kotlin
   val requestBody = ProgressRequestBody(file.asRequestBody("image/jpeg".toMediaType())) { 
       bytesWritten, totalBytes ->
       val progress = (bytesWritten * 100 / totalBytes).toInt()
       updateProgress(progress)
   }
   ```

5. **Error Handling:** Always handle network errors and server errors gracefully.

6. **Compression:** Recommended to compress images before upload to save bandwidth:
   ```kotlin
   // Compress image to max 1920x1080
   val compressed = Compressor.compress(context, originalFile) {
       resolution(1920, 1080)
       quality(80)
       format(Bitmap.CompressFormat.JPEG)
   }
   ```

7. **Socket.IO Connection:** Establish Socket.IO connection before sending messages:
   ```kotlin
   val socket = IO.socket("http://34.124.227.173:6000")
   socket.connect()
   
   socket.on(Socket.EVENT_CONNECT) {
       socket.emit("user:join", userId)
   }
   
   socket.on("message:new") { args ->
       val message = args[0] as JSONObject
       // Handle received message
   }
   ```

---

## Testing

**Test Upload (cURL):**
```bash
curl -X POST http://34.124.227.173:3000/api/chat/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Verify File in Bucket:**
```
https://console.cloud.google.com/storage/browser/zola-uploads-2470576/chat-images
```

---

## Support

For issues or questions:
- Check backend logs: `docker compose logs backend`
- Verify GCS credentials are configured
- Ensure network connectivity to GCP
- Contact backend team for API changes

---

**Last Updated:** December 6, 2025  
**Backend Version:** 1.0  
**API Status:** Production Ready ✅
