import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '@/lib/auth';
import {
  downloadAndSaveProfilePicture,
  getProfilePictureUri,
} from '@/lib/profile-picture';
import { SafeView } from '@/lib/safe-view';

type FormDataFile = {
  uri: string;
  name: string;
  type: string | undefined;
};

// Profile Picture Component
const ProfilePicture = ({
  uri,
  imageKey,
  uploading,
  onUpdate,
}: {
  uri: string | null;
  imageKey: number;
  uploading: boolean;
  onUpdate: () => void;
}) => (
  <View className="relative">
    <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white/20">
      {uri ? (
        <Image
          key={imageKey}
          source={{
            uri: `${uri}?timestamp=${Date.now()}`,
            cache: 'reload',
          }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="person" size={72} color="white" />
      )}
    </View>
    <TouchableOpacity
      className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow"
      onPress={onUpdate}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color="#3B82F6" />
      ) : (
        <MaterialCommunityIcons name="pencil" size={18} color="#3B82F6" />
      )}
    </TouchableOpacity>
  </View>
);

// Menu Item Component
const MenuItem = ({
  icon,
  iconColor,
  bgColor,
  title,
  subtitle,
  onPress,
  loading,
  textColor = 'text-gray-900',
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  loading?: boolean;
  textColor?: string;
}) => (
  <TouchableOpacity
    className="mb-3 flex-row items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
    onPress={onPress}
    disabled={loading}
  >
    <View
      className={`h-10 w-10 ${bgColor} items-center justify-center rounded-full`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      )}
    </View>
    <View className="ml-3 flex-1">
      <Text className={`${textColor} text-base font-medium`}>{title}</Text>
      <Text className="text-sm text-gray-500">{subtitle}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function Profile() {
  const authState = useContext(AuthContext);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(
    null
  );
  const [imageKey, setImageKey] = useState(0);

  const refreshProfilePicture = async () => {
    if (!authState?.authData?.user.id) return;

    const uri = await getProfilePictureUri(authState.authData.user.id);
    setProfilePictureUri(uri);
    requestAnimationFrame(() => setImageKey((prev) => prev + 1));
  };

  useEffect(() => {
    refreshProfilePicture();
  }, [authState?.authData?.user.id]);

  const handleLogout = async () => {
    if (!authState?.logOut) return;

    setIsSigningOut(true);
    try {
      await authState.logOut();
      router.replace('/welcome');
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to sign out. Please try again.'
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleProfilePictureUpdate = async () => {
    if (!authState?.authData?.session?.access_token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need camera roll permissions to update your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploading(true);
      const localUri = result.assets[0].uri;
      const formData = new FormData();
      const fileToUpload: FormDataFile = {
        uri: localUri,
        name: localUri.split('/').pop() || 'image.jpg',
        type: result.assets[0].mimeType,
      };

      // @ts-expect-error React Native's FormData accepts File-like objects
      formData.append('file', fileToUpload);

      try {
        const response = await fetch(
          'https://rest.trip-nus.com/rider/picture',
          {
            method: 'POST',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${authState.authData.session.access_token}`,
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok && authState.authData && authState.setAuthData) {
          const updatedAuthData = {
            ...authState.authData,
            riderProfilePictureUrl: data.data.profile_picture_url,
          };

          try {
            // First update auth data
            await authState.setAuthData(updatedAuthData);

            // Then download and save the new picture
            if (authState.authData.user.id) {
              await downloadAndSaveProfilePicture(
                authState.authData.user.id,
                data.data.profile_picture_url
              );

              Alert.alert(
                'Profile Picture Updated',
                'Please sign in again to see your new profile picture.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      try {
                        await authState.logOut();
                        router.replace('/welcome');
                      } catch (error) {
                        console.error('Error during logout:', error);
                        Alert.alert(
                          'Error',
                          'Failed to sign out. Please try manually signing out.'
                        );
                      }
                    },
                  },
                ]
              );
            }
          } catch (error: unknown) {
            console.error('Error updating profile picture:', error);
            Alert.alert(
              'Error',
              error instanceof Error
                ? error.message
                : 'Failed to save profile picture'
            );
          }
        } else {
          Alert.alert(
            'Error',
            data.message || 'Failed to update profile picture'
          );
        }
      } catch (error: unknown) {
        console.error('Error uploading image:', error);
        Alert.alert(
          'Error',
          error instanceof Error
            ? error.message
            : 'Failed to upload image. Please try again.'
        );
      }
    } catch (error: unknown) {
      console.error('Unexpected error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setUploading(false);
    }
  };

  if (!authState?.authData?.session) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeView statusBackgroundColor="bg-blue-600" statusBarStyle="light">
      <View className="flex-1 bg-blue-600">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Header */}
        <View className="items-center pb-10 pt-8">
          <ProfilePicture
            uri={profilePictureUri}
            imageKey={imageKey}
            uploading={uploading}
            onUpdate={handleProfilePictureUpdate}
          />
          <Text className="mt-4 text-2xl font-semibold text-white">
            {authState.authData.firstName} {authState.authData.lastName}
          </Text>

          {/* Contact Information */}
          <View className="mt-3 w-full px-4">
            <View className="flex-row flex-wrap items-center justify-center gap-3">
              <View className="flex-shrink flex-row items-center rounded-full bg-white/10 px-4 py-2">
                <Ionicons name="mail-outline" size={16} color="white" />
                <Text
                  className="ml-2 flex-shrink text-base text-white/90"
                  numberOfLines={1}
                >
                  {authState.authData.user.email}
                </Text>
              </View>
              <View className="flex-row items-center rounded-full bg-white/10 px-4 py-2">
                <Ionicons name="call-outline" size={16} color="white" />
                <Text className="ml-2 text-base text-white/90">
                  +{authState.authData.user.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="flex-1 rounded-t-3xl bg-white">
          <ScrollView className="flex-1 pt-4">
            <View className="px-4">
              <MenuItem
                icon="account-outline"
                iconColor="#3B82F6"
                bgColor="bg-blue-100"
                title="Personal Information"
                subtitle="Update your details"
                onPress={() => router.push('/profile/personal-information')}
              />
              <MenuItem
                icon="help-circle-outline"
                iconColor="#8B5CF6"
                bgColor="bg-purple-100"
                title="Help & Support"
                subtitle="Get assistance"
                onPress={() => {}}
              />
              <MenuItem
                icon="logout"
                iconColor="#EF4444"
                bgColor="bg-red-100"
                title={isSigningOut ? 'Signing Out...' : 'Sign Out'}
                subtitle={
                  isSigningOut ? 'Please wait...' : 'Logout from account'
                }
                onPress={handleLogout}
                loading={isSigningOut}
                textColor="text-red-500"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeView>
  );
}
