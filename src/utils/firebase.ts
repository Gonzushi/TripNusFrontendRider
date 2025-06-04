import { getApp, getApps, initializeApp } from "@react-native-firebase/app";
import { Platform } from "react-native";

export async function initializeFirebase() {
  if (Platform.OS === "android") {
    try {
      if (getApps().length === 0) {
        console.log("Initializing Firebase...");
        // Initialize with complete config from google-services.json
        const config = {
          appId: "1:906949460227:android:28446e625a64a6f7afe936",
          apiKey: "AIzaSyC0_i_u5GvRGNItqvzixhUoFj8mfFQJ7Sw",
          projectId: "tripnus",
          databaseURL:
            "https://tripnus-default-rtdb.asia-southeast1.firebasedatabase.app",
          storageBucket: "tripnus.firebasestorage.app",
          messagingSenderId: "906949460227",
        };

        // Initialize Firebase with the config
        await initializeApp(config);
        console.log("Firebase initialized successfully");
      } else {
        console.log("Firebase already initialized, getting existing app");
        getApp();
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
      throw error; // Re-throw to handle in the calling code
    }
  } else {
    console.log("Firebase initialization skipped for non-Android platform");
  }
}
