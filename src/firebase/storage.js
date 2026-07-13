import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from './config';

/**
 * UPLOAD IMAGE
 * Generic function to upload an image to a specific path
 * @param {File} file - The image file from the input
 * @param {string} path - Folder path (e.g., 'profiles', 'posts', 'clubs')
 * @returns {Promise<string>} - The public download URL
 */
export const uploadImage = async (file, path) => {
  if (!file) return null;

  try {
    // Create a unique filename using timestamp to avoid overwriting
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get and return the URL
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Storage Upload Error:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
};

/**
 * UPDATE USER AVATAR
 * Specifically for the Onboarding/Profile pages
 */
export const uploadUserAvatar = async (uid, file) => {
  return await uploadImage(file, `avatars/${uid}`);
};

/**
 * UPLOAD CLUB ASSETS
 * For Club Logos or official banners
 */
export const uploadClubAsset = async (clubId, file) => {
  return await uploadImage(file, `clubs/${clubId}/assets`);
};

/**
 * DELETE ASSET
 * Cleans up storage when a post or profile picture is replaced
 */
export const deleteAsset = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Storage Deletion Error:", error);
    // We don't necessarily want to crash the app if a delete fails
  }
};