import express from 'express';
import multer from 'multer';
import { uploadFile, listFiles } from '../services/uploadService';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Test upload endpoint (no auth required for demo)
router.post('/test', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }
    
    console.log('📤 Uploading file:', req.file.originalname);
    const url = await uploadFile(req.file, 'test');
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully to GCP',
      url,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed',
      details: (error as Error).message 
    });
  }
});

// List uploaded files
router.get('/list', async (req, res) => {
  try {
    const folder = req.query.folder as string | undefined;
    const files = await listFiles(folder);
    
    res.json({ 
      success: true, 
      count: files.length,
      files 
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list files',
      details: (error as Error).message 
    });
  }
});

// Info endpoint
router.get('/info', (req, res) => {
  res.json({
    success: true,
    message: 'GCP File Upload API',
    endpoints: {
      upload: 'POST /api/upload/test - Upload a file (multipart/form-data, field: file)',
      list: 'GET /api/upload/list?folder=test - List uploaded files',
      info: 'GET /api/upload/info - This endpoint'
    },
    bucket: process.env.GCS_BUCKET_NAME,
    maxSize: '5MB'
  });
});

export default router;
