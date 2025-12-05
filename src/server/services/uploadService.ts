import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILE,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'zalo-clone-uploads';
const bucket = storage.bucket(bucketName);

/**
 * Upload a file to Google Cloud Storage
 * @param fileBuffer - File buffer from multer
 * @param fileName - Original filename
 * @param mimeType - MIME type of the file
 * @param folder - Folder to organize files (images/videos/documents)
 * @returns Public URL of the uploaded file
 */
export const uploadFileToGCS = async (
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: 'images' | 'videos' | 'documents'
): Promise<{ url: string; thumbnailUrl?: string }> => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const gcsFileName = `${folder}/${timestamp}-${sanitizedFileName}`;

    const blob = bucket.file(gcsFileName);

    // Upload file to GCS
    await blob.save(fileBuffer, {
        metadata: {
            contentType: mimeType,
        },
        public: true, // Make file publicly accessible
    });

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;

    return {
        url: publicUrl,
        thumbnailUrl: mimeType.startsWith('image/') ? publicUrl : undefined,
    };
};

/**
 * Delete a file from Google Cloud Storage
 * @param fileUrl - Public URL of the file to delete
 */
export const deleteFileFromGCS = async (fileUrl: string): Promise<void> => {
    try {
        // Extract filename from URL
        const fileName = fileUrl.split(`${bucketName}/`)[1];
        if (!fileName) {
            throw new Error('Invalid file URL');
        }

        const file = bucket.file(fileName);
        await file.delete();
    } catch (error) {
        console.error('Error deleting file from GCS:', error);
        throw error;
    }
};
