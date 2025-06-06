import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import path from 'path';

import { API_URL, SUPABASE_STORAGE_URL } from './constants';
import { type PreparedImage } from './types';
import { compressImage, getFileInfo, getStorageKey } from './utils';

// Clears a user's profile picture from storage
export const clearProfilePicture = async (userId: string): Promise<void> => {
  try {
    const storageKey = getStorageKey(userId);
    if (!FileSystem.documentDirectory) return;

    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );

    // Delete any file that starts with profile-picture-userId
    const filePrefix = `profile-picture-${userId}`;
    for (const file of files) {
      if (file.startsWith(filePrefix)) {
        const filePath = `${FileSystem.documentDirectory}${file}`;
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }

    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing profile picture:', error);
  }
};

// Downloads and saves a user's profile picture
export const downloadAndSaveProfilePicture = async (
  userId: string,
  relativePath: string
): Promise<string | null> => {
  if (!relativePath) return null;

  try {
    await clearProfilePicture(userId);

    // Get the file extension from the original path
    const extension = path.extname(relativePath);
    const fileName = `profile-picture-${userId}${extension}`;
    const finalUri = `${FileSystem.documentDirectory}${fileName}`;
    const downloadUrl = `${SUPABASE_STORAGE_URL}/${relativePath}`;
    const storageKey = getStorageKey(userId);

    // Download directly to final location
    await FileSystem.downloadAsync(downloadUrl, finalUri);

    await AsyncStorage.setItem(storageKey, finalUri);
    return finalUri;
  } catch (error) {
    console.error('Error downloading profile picture:', error);
    return null;
  }
};

// Gets the URI of a user's profile picture
export const getProfilePictureUri = async (
  userId: string
): Promise<string | null> => {
  try {
    const storageKey = getStorageKey(userId);
    const uri = await AsyncStorage.getItem(storageKey);
    const fileInfo = await getFileInfo(uri);

    if (fileInfo?.exists) {
      return fileInfo.uri;
    }

    if (uri) {
      await AsyncStorage.removeItem(storageKey);
    }

    return null;
  } catch (error) {
    console.error('Error getting profile picture URI:', error);
    return null;
  }
};

// Prepares an image for upload (with compression)
export const prepareImageForUpload = async (
  uri: string
): Promise<PreparedImage> => {
  try {
    // Compress the image while maintaining its format
    const compressedUri = await compressImage(uri);

    // Get the mime type based on file extension
    const extension = path.extname(uri).toLowerCase();
    const mimeType =
      extension === '.png'
        ? 'image/png'
        : extension === '.gif'
          ? 'image/gif'
          : extension === '.webp'
            ? 'image/webp'
            : 'image/jpeg'; // default to jpeg for jpg/jpeg/unknown

    return {
      uri: compressedUri,
      type: mimeType,
    };
  } catch (error) {
    console.error('Error preparing image for upload:', error);
    throw error;
  }
};

/**
 * Updates the user's profile picture with image picker, compression, and upload
 */
export const updateProfilePicture = async (
  accessToken: string,
  userId: string
): Promise<{ success: boolean; pictureUrl?: string; error?: string }> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error(
        'Maaf, kami membutuhkan izin akses galeri untuk memperbarui foto profil Anda.'
      );
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // We'll handle compression ourselves
    });

    if (result.canceled) {
      return { success: false };
    }

    // Prepare and compress image
    const preparedImage = await prepareImageForUpload(result.assets[0].uri);

    // Create form data
    const formData = new FormData();
    // @ts-expect-error React Native's FormData accepts File-like objects
    formData.append('file', {
      uri: preparedImage.uri,
      type: preparedImage.type,
      name: `profile-${userId}${path.extname(preparedImage.uri)}`,
    });

    // Upload image
    const response = await fetch(`${API_URL}/rider/picture`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengunggah foto profil');
    }

    return {
      success: true,
      pictureUrl: data.data.profile_picture_url,
    };
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan tak terduga',
    };
  }
};
