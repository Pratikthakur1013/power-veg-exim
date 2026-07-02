/**
 * Firebase Storage Upload Helper
 * Replaces multer disk storage for Vercel (no persistent filesystem).
 *
 * Files are uploaded to Firebase Storage and a public URL is returned.
 * Requires FIREBASE_STORAGE_BUCKET env var (e.g. your-project.appspot.com)
 * or falls back to VITE_FIREBASE_STORAGE_BUCKET.
 */

import { getFirebaseAdmin } from './firebaseAdmin.js';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

function getBucket() {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error('[FirebaseStorage] Firebase Admin SDK not initialized.');
  }

  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (!bucketName) {
    throw new Error(
      '[FirebaseStorage] Missing FIREBASE_STORAGE_BUCKET env var. ' +
      'Set it to your Firebase Storage bucket name (e.g. your-project.appspot.com).'
    );
  }

  return getStorage(app).bucket(bucketName);
}

/**
 * Upload a file buffer to Firebase Storage.
 *
 * @param buffer       - File content as Buffer
 * @param originalName - Original filename (used for extension detection)
 * @param folder       - Storage folder prefix (e.g. 'uploads', 'logos', 'pdfs')
 * @param mimeType     - MIME type of the file
 * @returns            - Public download URL
 */
export async function uploadToFirebaseStorage(
  buffer: Buffer,
  originalName: string,
  folder: string,
  mimeType: string
): Promise<string> {
  const bucket = getBucket();
  const ext = path.extname(originalName);
  const fileName = `${folder}/${uuidv4()}${ext}`;

  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
    },
  });

  // Make the file publicly accessible
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return publicUrl;
}

/**
 * Delete a file from Firebase Storage given its public URL.
 * Silently ignores errors (file may already be deleted).
 */
export async function deleteFromFirebaseStorage(publicUrl: string): Promise<void> {
  try {
    const bucket = getBucket();
    // Extract path from URL: https://storage.googleapis.com/BUCKET/PATH
    const urlPath = new URL(publicUrl).pathname;
    const bucketPrefix = `/${bucket.name}/`;
    const filePath = urlPath.startsWith(bucketPrefix)
      ? urlPath.slice(bucketPrefix.length)
      : urlPath.slice(1);

    await bucket.file(decodeURIComponent(filePath)).delete();
  } catch (err) {
    console.warn('[FirebaseStorage] Could not delete file:', err);
  }
}
