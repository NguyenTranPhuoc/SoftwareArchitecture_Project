import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/uploadService';

const router = express.Router();

// Multer config for images/videos only
const mediaUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for images/videos
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Multer config for all file types
const fileUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for general files
});

// Upload chat image (for sending in messages)
router.post('/image', mediaUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image provided' 
      });
    }
    
    console.log('Uploading chat image:', req.file.originalname);
    const url = await uploadFile(req.file, 'chat-images');
    
    // Return image URL that can be sent in chat message
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imageUrl: url,
      thumbnail: url, // You can generate thumbnails later
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat image upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Image upload failed',
      details: (error as Error).message 
    });
  }
});

// Upload multiple images (for photo albums in chat)
router.post('/images', mediaUpload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No images provided' 
      });
    }
    
    console.log(`Uploading ${files.length} chat images`);
    
    // Upload all images in parallel
    const uploadPromises = files.map(file => uploadFile(file, 'chat-images'));
    const urls = await Promise.all(uploadPromises);
    
    res.json({ 
      success: true, 
      message: `${files.length} images uploaded successfully`,
      images: urls.map((url, index) => ({
        url,
        thumbnail: url,
        filename: files[index].originalname,
        size: files[index].size,
        mimetype: files[index].mimetype
      }))
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Images upload failed',
      details: (error as Error).message 
    });
  }
});

// Upload video (for video messages)
router.post('/video', mediaUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video provided' 
      });
    }
    
    console.log('Uploading chat video:', req.file.originalname);
    const url = await uploadFile(req.file, 'chat-images'); // Using same folder for simplicity
    
    res.json({ 
      success: true, 
      message: 'Video uploaded successfully',
      videoUrl: url,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        duration: null, // You can extract video duration later
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat video upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Video upload failed',
      details: (error as Error).message 
    });
  }
});

// Upload general file (PDFs, documents, etc.)
router.post('/file', fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }
    
    console.log('Uploading chat file:', req.file.originalname);
    const url = await uploadFile(req.file, 'chat-images'); // Using same folder
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      fileUrl: url,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat file upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'File upload failed',
      details: (error as Error).message 
    });
  }
});

// Info endpoint for chat uploads
router.get('/info', (req, res) => {
  res.json({
    success: true,
    message: 'Chat Media Upload API',
    endpoints: {
      uploadImage: 'POST /api/chat/image - Upload single image (field: image)',
      uploadImages: 'POST /api/chat/images - Upload multiple images (field: images, max: 10)',
      uploadVideo: 'POST /api/chat/video - Upload video (field: video)',
      uploadFile: 'POST /api/chat/file - Upload any file (field: file)',
      info: 'GET /api/chat/info - This endpoint'
    },
    limits: {
      maxImageVideoSize: '50MB',
      maxFileSize: '100MB',
      maxImages: 10,
      imageVideoTypes: ['image/*', 'video/*'],
      fileTypes: 'all'
    },
    usage: {
      step1: 'Upload media using one of the endpoints above',
      step2: 'Get the returned URL',
      step3: 'Send the URL in your chat message via Socket.IO',
      example: {
        type: 'image',
        content: 'Check this out!',
        imageUrl: 'https://storage.googleapis.com/...'
      }
    }
  });
});

export default router;
