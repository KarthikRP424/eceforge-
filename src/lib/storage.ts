// ============================================================
// ECEForge — Firebase Storage Helpers
// ============================================================

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload a PDF file to Firebase Storage.
 * Returns the storagePath and a promise resolving to the download URL.
 */
export function uploadResourceFile(
  file: File,
  schemeId: string,
  subjectId: string,
  onProgress?: UploadProgressCallback,
): { task: UploadTask; path: string } {
  const timestamp  = Date.now();
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path       = `resources/${schemeId}/${subjectId}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);

  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt:   new Date().toISOString(),
    },
  });

  if (onProgress) {
    task.on('state_changed', snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    });
  }

  return { task, path };
}

/**
 * Get a signed download URL for a stored PDF.
 */
export async function getResourceDownloadURL(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Firebase Storage by its path.
 */
export async function deleteResourceFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
