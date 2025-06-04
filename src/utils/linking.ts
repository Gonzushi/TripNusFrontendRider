import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

const prefix = Linking.createURL("/");

export const linking: LinkingOptions<any> = {
  prefixes: [
    // App-specific scheme
    "tripnus-rider://",
    // Development URLs (for Expo Go)
    "exp://192.168.100.244:8081",
    prefix,
  ],
  config: {
    screens: {
      "reset-password": {
        path: "reset-password",
        parse: {
          data: (data: string) => data,
        },
      },
      // Add other screens as needed
      login: "login",
      register: "register",
      welcome: "welcome",
    },
  },
};
