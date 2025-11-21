import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILE || './config/zola-478416-4990089e3062.json'
});

const bucketName = process.env.GCS_BUCKET_NAME || 'zola-uploads-2470576';
const bucket = storage.bucket(bucketName);

export const uploadFile = async (
  file: Express.Multer.File,
  folder: 'avatars' | 'chat-images' | 'test'
): Promise<string> => {
  // Create unique filename
  const fileName = `${folder}/${Date.now()}_${file.originalname}`;
  const blob = bucket.file(fileName);

  // Upload to GCS
  const stream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      console.error('Upload error:', error);
      reject(error);
    });
    
    stream.on('finish', async () => {
      // Make the file public
      await blob.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      console.log('✓ File uploaded:', publicUrl);
      resolve(publicUrl);
    });
    
    stream.end(file.buffer);
  });
};

export const listFiles = async (folder?: string): Promise<string[]> => {
  const options = folder ? { prefix: `${folder}/` } : {};
  const [files] = await bucket.getFiles(options);
  return files.map(file => `https://storage.googleapis.com/${bucketName}/${file.name}`);
};

export const deleteFile = async (fileName: string): Promise<void> => {
  await bucket.file(fileName).delete();
  console.log('✓ File deleted:', fileName);
};
