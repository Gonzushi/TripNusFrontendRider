import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const PROFILE_PICTURE_STORAGE_KEY = "profile-picture-";
const SUPABASE_STORAGE_URL =
  "https://mvmxgiflitlviqimsips.supabase.co/storage/v1/object/public";
const dev = false;

// Debug utility
const debugLog = (message: string, error?: any) => {
  if (dev) {
    if (error) {
      console.error(message, error);
    } else {
      console.log(message);
    }
  }
};

type ProfilePictureInfo = {
  uri: string;
  exists: boolean;
};

/**
 * Gets the storage key for a user's profile picture
 */
const getStorageKey = (userId: string) =>
  `${PROFILE_PICTURE_STORAGE_KEY}${userId}`;

/**
 * Compresses and converts an image to JPG format
 */
export const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    debugLog("Error compressing image:", error);
    throw error;
  }
};

/**
 * Gets the file info for a profile picture URI
 */
const getFileInfo = async (
  uri: string | null
): Promise<ProfilePictureInfo | null> => {
  if (!uri) return null;

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return { uri, exists: fileInfo.exists };
  } catch (error) {
    debugLog("Error checking file info:", error);
    return null;
  }
};

/**
 * Clears a user's profile picture from storage
 */
export const clearProfilePicture = async (userId: string): Promise<void> => {
  try {
    const storageKey = getStorageKey(userId);
    if (!FileSystem.documentDirectory) return;

    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );
    const targetFile = `${userId}.jpg`;

    for (const file of files) {
      if (file === targetFile) {
        const filePath = `${FileSystem.documentDirectory}${file}`;
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }

    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    debugLog("Error clearing profile picture:", error);
  }
};

/**
 * Downloads and saves a user's profile picture
 */
export const downloadAndSaveProfilePicture = async (
  userId: string,
  relativePath: string
): Promise<string | null> => {
  if (!relativePath) return null;

  try {
    await clearProfilePicture(userId);

    const tempFileUri = `${FileSystem.documentDirectory}${userId}_temp`;
    const downloadUrl = `${SUPABASE_STORAGE_URL}/${relativePath}`;
    const storageKey = getStorageKey(userId);

    const { uri: downloadedUri } = await FileSystem.downloadAsync(
      downloadUrl,
      tempFileUri
    );

    const compressedUri = await compressImage(downloadedUri);

    const finalUri = `${FileSystem.documentDirectory}${userId}.jpg`;
    await FileSystem.moveAsync({
      from: compressedUri,
      to: finalUri,
    });

    try {
      await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
    } catch (error) {
      debugLog("Error cleaning up temp file:", error);
    }

    await AsyncStorage.setItem(storageKey, finalUri);
    return finalUri;
  } catch (error) {
    debugLog("Error downloading profile picture:", error);
    return null;
  }
};

/**
 * Gets the URI of a user's profile picture
 */
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
    debugLog("Error getting profile picture URI:", error);
    return null;
  }
};

/**
 * Prepares an image for upload by compressing and converting to JPG
 */
export const prepareImageForUpload = async (
  uri: string
): Promise<{ uri: string; type: string }> => {
  try {
    const compressedUri = await compressImage(uri);
    return {
      uri: compressedUri,
      type: "image/jpeg",
    };
  } catch (error) {
    debugLog("Error preparing image for upload:", error);
    throw error;
  }
};
