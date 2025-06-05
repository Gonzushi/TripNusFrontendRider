import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { ProfilePictureInfo } from './types';

// Gets the storage key for a user's profile picture
export const getStorageKey = (userId: string) => `profile-picture-${userId}`;

// Compresses an image while maintaining its original format
export const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

// Gets the file info for a profile picture URI
export const getFileInfo = async (
  uri: string | null
): Promise<ProfilePictureInfo | null> => {
  if (!uri) return null;

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return { uri, exists: fileInfo.exists };
  } catch (error) {
    console.error('Error checking file info:', error);
    return null;
  }
};
