import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://rest.trip-nus.com/auth/reset-password-for-email",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        Alert.alert(
          "Success",
          "Password reset instructions have been sent to your email",
          [
            {
              text: "Back to Login",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to send reset password email"
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while connecting to the server");
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
              <Ionicons name="key" size={32} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Enter your email address and we'll send you instructions to reset
              your password.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mx-2">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1.5">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <View className="pl-4 pr-2">
                  <Ionicons name="mail" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 py-3 px-2"
                  placeholder="you@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-8 space-y-4 mx-2">
            <TouchableOpacity
              className={`${
                isLoading ? "bg-blue-300" : "bg-blue-600"
              } py-4 rounded-xl items-center flex-row justify-center mb-4`}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-base">
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              onPress={() => router.back()}
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
