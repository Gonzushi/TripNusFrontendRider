import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Extract parameters from URL
  const [urlParams] = useState(() => {
    try {
      // Get type and tokenHash directly from params
      const type = params.type as string;
      const tokenHash = params.tokenHash as string;

      // Parse the data parameter which is URL encoded
      const dataStr = decodeURIComponent(params.data as string);
      // Remove 'map[' prefix and ']' suffix and extract email
      const cleanDataStr = dataStr.replace(/^map\[|\]$/g, "");
      const emailMatch = cleanDataStr.match(/email:(.*?)\s/);
      const email = emailMatch?.[1] || "";

      console.log("Parsed URL Parameters:", {
        type,
        tokenHash,
        email,
        dataStr,
      });

      return { type, tokenHash, email };
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      return { type: "", tokenHash: "", email: "" };
    }
  });

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: "At least 6 characters long",
      regex: /^.{6,}$/,
      met: false,
    },
    {
      label: "Contains lowercase letter (a-z)",
      regex: /[a-z]/,
      met: false,
    },
    {
      label: "Contains uppercase letter (A-Z)",
      regex: /[A-Z]/,
      met: false,
    },
    {
      label: "Contains number (0-9)",
      regex: /[0-9]/,
      met: false,
    },
    {
      label: "Contains special character (!@#$%^&*()_+-=[]{};\\':\"|<>?,./`~)",
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/,
      met: false,
    },
  ]);

  // Check password requirements whenever password changes
  useEffect(() => {
    setRequirements((prev) =>
      prev.map((req) => ({
        ...req,
        met: req.regex.test(password),
      }))
    );
  }, [password]);

  const allRequirementsMet = requirements.every((req) => req.met);

  const handleResetPassword = async () => {
    if (!urlParams.type || !urlParams.tokenHash) {
      Alert.alert("Error", "Invalid reset password link", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://rest.trip-nus.com/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: urlParams.type,
            tokenHash: urlParams.tokenHash,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Data:", data);

      if (response.ok) {
        Alert.alert("Success", "Password has been changed successfully", [
          {
            text: "OK",
            onPress: () => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/welcome");
            },
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to change password", [
          {
            text: "OK",
            onPress: () => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/welcome");
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred", [
        {
          text: "OK",
          onPress: () => {
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace("/welcome");
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 justify-between">
        {/* Top Section */}
        <View>
          {/* Logo Section */}
          <View className="items-center mt-6">
            <View className="flex-row items-center">
              <View className="bg-blue-600 w-12 h-12 rounded-xl items-center justify-center mr-2">
                <Ionicons name="car" size={30} color="white" />
              </View>
              <Text className="text-2xl font-bold text-blue-600">TripNus</Text>
            </View>
          </View>
        </View>

        {/* Main Content - Centered */}
        <View className="px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-open" size={32} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Please set a new password for your account{"\n"}
              {urlParams.email}
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mx-2">
            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1.5">New Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <View className="pl-4 pr-2">
                  <Ionicons name="lock-closed" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 py-3 px-2"
                  placeholder="Enter your new password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Password Requirements */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Password Requirements:
              </Text>
              {requirements.map((req, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <Ionicons
                    name={req.met ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={req.met ? "#10B981" : "#EF4444"}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      req.met ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-8 space-y-4 mx-2">
            <TouchableOpacity
              className={`${
                !allRequirementsMet || isLoading ? "bg-gray-300" : "bg-blue-600"
              } py-4 rounded-xl items-center flex-row justify-center mb-4`}
              onPress={handleResetPassword}
              disabled={!allRequirementsMet || isLoading}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-base">
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              onPress={() => router.replace("/login")}
            >
              <Text className="text-blue-600 font-semibold text-base">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View>
          {/* Terms */}
          <Text className="text-sm text-gray-500 text-center px-6 mb-4">
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </View>
  );
}
