import express from 'express';
import multer from 'multer';
import { uploadFileToGCS } from '../services/uploadService';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
    },
    fileFilter: (req, file, cb) => {
        // Validate file types
        const allowedTypes = [
            // Images
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            // Videos
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/quicktime',
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
            'text/plain',
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    },
});

/**
 * Upload image endpoint
 * POST /api/upload/image
 * Max size: 10MB
 */
router.post('/image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Validate image size (10MB)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large. Max 10MB' });
        }

        const result = await uploadFileToGCS(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            'images'
        );

        res.json({
            success: true,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Upload video endpoint
 * POST /api/upload/video
 * Max size: 50MB
 */
router.post('/video', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Validate video size (50MB)
        if (req.file.size > 50 * 1024 * 1024) {
            return res.status(400).json({ error: 'Video too large. Max 50MB' });
        }

        const result = await uploadFileToGCS(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            'videos'
        );

        res.json({
            success: true,
            url: result.url,
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Upload file/document endpoint
 * POST /api/upload/file
 * Max size: 100MB
 */
router.post('/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Validate file size (100MB)
        if (req.file.size > 100 * 1024 * 1024) {
            return res.status(400).json({ error: 'File too large. Max 100MB' });
        }

        const result = await uploadFileToGCS(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            'documents'
        );

        res.json({
            success: true,
            url: result.url,
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
