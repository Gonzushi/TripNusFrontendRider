import { Ionicons } from '@expo/vector-icons';

import { useCallback, useContext, useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '@/lib/auth';
import { getProfilePictureUri } from '@/lib/profile-picture';
import { SafeView } from '@/lib/safe-view';
import type { LocationDetail } from '@/types/location';

export default function Index() {
  const { authData } = useContext(AuthContext);
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(
    null
  );

  // Store current location details for reuse
  const currentLocationDetails: LocationDetail = {
    title: 'Current Location',
    address: 'Getting your location...',
    coordinates: undefined,
  };

  const refreshProfilePicture = async () => {
    if (authData?.user.id) {
      const uri = await getProfilePictureUri(authData.user.id);
      setProfilePictureUri(uri);
    }
  };

  // Refresh profile picture when auth data changes
  useEffect(() => {
    refreshProfilePicture();
  }, [authData?.user.id, authData?.riderProfilePictureUrl]);

  const handleSearchPress = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);

    router.push({
      pathname: '/ride-request',
      params: {
        currentLocationDetails: JSON.stringify(currentLocationDetails),
      },
    });

    // Reset the flag after a short delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  }, [isNavigating, currentLocationDetails, router]);

  const handleInvite = async () => {
    try {
      const result = await Share.share({
        url: 'https://play.google.com/store/apps/details?id=com.tripnus',
        title: 'Share TripNus',
        message:
          "Join me on TripNus! The local ride-sharing app that's making transportation better in Indonesia. Download now!",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <SafeView isShowingTabBar={true}>
      <ScrollView className="flex-1 bg-white">
        {/* Header Section */}
        <View className="px-4 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-baseline">
                <Text className="text-3xl text-gray-600">Hi, </Text>
                <Text className="text-3xl font-bold text-blue-600">
                  {authData?.firstName || 'Hendry'}
                </Text>
              </View>
              <Text className="text-lg text-gray-600 mt-2 leading-6">
                Ready for your next adventure?
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleProfilePress}
              className="w-20 h-20 items-center justify-center"
            >
              <View className="absolute w-[72px] h-[72px] rounded-full border-2 border-blue-500" />
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
                {profilePictureUri ? (
                  <Image
                    source={{ uri: profilePictureUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={32} color="#4B5563" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        {/* <View className="px-4 py-6">
          <View className="flex-row justify-between">
            <View className="bg-blue-50 p-4 rounded-xl flex-1 mr-2 border border-blue-100">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="car" size={20} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">82</Text>
              <Text className="text-sm text-gray-600">Total Trips</Text>
            </View>
            <View className="bg-purple-50 p-4 rounded-xl flex-1 mx-2 border border-purple-100">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="map" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">13 km</Text>
              <Text className="text-sm text-gray-600">Avg Distance</Text>
            </View>
            <View className="bg-yellow-50 p-4 rounded-xl flex-1 ml-2 border border-yellow-100">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="star" size={20} color="#EAB308" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">4.9</Text>
              <Text className="text-sm text-gray-600">Rating</Text>
            </View>
          </View>
        </View> */}

        {/* Search Input */}
        <View className="px-4 mt-2">
          <TouchableOpacity
            onPress={handleSearchPress}
            className="bg-gray-50 rounded-xl p-4 flex-row items-center border border-gray-200 active:bg-gray-100"
          >
            <Ionicons name="location" size={20} color="#6B7280" />
            <Text className="flex-1 ml-3 text-gray-500">
              Enter your destination
            </Text>
            <Ionicons name="search" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Start Trip Button */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            onPress={handleSearchPress}
            className="bg-blue-600 rounded-xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="car" size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-base ml-2">
              Start Trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tagline */}
        <View className="px-4 mt-4">
          <Text className="text-center text-gray-500">
            TripNus — Fast, safe, and reliable rides
          </Text>
        </View>

        {/* Divider */}
        <View className="mt-8 mb-6 px-4">
          <View className="h-[1px] bg-gray-300" />
        </View>

        {/* Community Support Section */}
        <View className="px-4">
          <View className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
            <View className="flex-row items-start">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800 mb-1">
                  Support Local Innovation
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Help us grow this local ride-sharing community. Share TripNus
                  with your friends and be part of Indonesia's transportation
                  future.
                </Text>
                <TouchableOpacity
                  onPress={handleInvite}
                  className="flex-row items-center mt-4"
                >
                  <Text className="text-blue-600 font-medium mr-1">
                    Share TripNus
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>
              <View className="ml-4">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                  <Ionicons name="share-social" size={20} color="#3B82F6" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
      {/* {dev && <NotificationDebug />} */}
    </SafeView>
  );
}
