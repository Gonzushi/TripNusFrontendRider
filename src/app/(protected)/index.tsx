import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '@/lib/auth';
import NotificationDebug from '@/lib/notification/notification-debug';
import { getProfilePictureUri } from '@/lib/profile-picture';
import { getActiveRide } from '@/lib/ride/api';
import { SafeView } from '@/lib/safe-view';

const DEBUG_MODE = true;

// Header component with profile picture
function Header({
  firstName,
  profilePictureUri,
  onProfilePress,
}: {
  firstName: string;
  profilePictureUri: string | null;
  onProfilePress: () => void;
}) {
  return (
    <View className="px-4 pb-4 pt-6">
      <View className="flex-row items-center justify-between">
        <View className="mr-4 flex-1">
          <View className="flex-row items-baseline">
            <Text className="text-3xl text-gray-600">Hai, </Text>
            <Text className="text-3xl font-bold text-blue-600">
              {firstName}
            </Text>
          </View>
          <Text className="mt-2 text-lg leading-6 text-gray-600">
            Siap untuk petualangan berikutnya?
          </Text>
        </View>
        <TouchableOpacity
          onPress={onProfilePress}
          className="h-20 w-20 items-center justify-center"
        >
          <View className="absolute h-[72px] w-[72px] rounded-full border-2 border-blue-500" />
          <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            {profilePictureUri ? (
              <Image
                className="h-full w-full"
                resizeMode="cover"
                source={{
                  uri: `${profilePictureUri}?timestamp=${Date.now()}`,
                  cache: 'reload',
                }}
              />
            ) : (
              <Ionicons name="person" size={32} color="#4B5563" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Stats card component
function StatCard({
  icon,
  iconColor,
  bgColor,
  borderColor,
  value,
  label,
  iconSize = 22,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  value: string;
  label: string;
  iconSize?: number;
}) {
  return (
    <View
      className={`aspect-square w-[31%] rounded-2xl border ${borderColor} ${bgColor} shadow-sm`}
    >
      <View className="flex-1 px-3 py-4">
        {/* Top 50%: Value and Icon */}
        <View
          style={{ flex: 5 }}
          className="flex-row items-center justify-between"
        >
          <Text className="text-xl font-bold text-gray-800">{value}</Text>
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${
              bgColor.replace('bg-', 'bg-') + '/90'
            }`}
          >
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          </View>
        </View>

        {/* Bottom 50%: Label aligned top-left, no truncation */}
        <View
          style={{ flex: 5 }}
          className="w-full items-start justify-start pt-1"
        >
          <Text
            className="w-full text-[13px] leading-[17px] text-gray-600"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Stats section component
function StatsSection() {
  return (
    <View className="px-4 py-6">
      <Text className="mb-4 text-base font-medium text-gray-800">
        Ringkasan Perjalanan
      </Text>
      <View className="flex-row justify-between">
        <StatCard
          icon="car"
          iconColor="#3B82F6"
          bgColor="bg-blue-50"
          borderColor="border-blue-100"
          value="82"
          label="Total Perjalanan"
          iconSize={26}
        />
        <StatCard
          icon="map"
          iconColor="#8B5CF6"
          bgColor="bg-purple-50"
          borderColor="border-purple-100"
          value="13 km"
          label="Jarak Rata-rata"
          iconSize={20}
        />
        <StatCard
          icon="star"
          iconColor="#EAB308"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-100"
          value="4.9"
          label="Penilaian"
          iconSize={26}
        />
      </View>
    </View>
  );
}

// Search bar component
function SearchBar({
  onPress,
  isLoading,
}: {
  onPress: () => void;
  isLoading: boolean;
}) {
  return (
    <View className="mt-2 px-4">
      <TouchableOpacity
        onPress={onPress}
        disabled={isLoading}
        className="h-14 flex-row items-center rounded-xl border border-gray-400 bg-gray-50 px-4 active:bg-gray-100 disabled:opacity-50"
      >
        <Ionicons name="location" size={20} color="#6B7280" />
        <Text className="ml-3 flex-1 text-gray-500">Masukkan tujuan Anda</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#6B7280" />
        ) : (
          <Ionicons name="search" size={20} color="#6B7280" />
        )}
      </TouchableOpacity>
    </View>
  );
}

// Community support section component
function CommunitySupport({ onShare }: { onShare: () => void }) {
  return (
    <View className="px-4">
      <View className="rounded-xl border border-blue-200/100 bg-blue-50/50 p-5">
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="mb-1 text-base font-medium text-gray-800">
              Dukung Inovasi Lokal
            </Text>
            <Text className="text-sm leading-5 text-gray-600">
              Bantu kami mengembangkan komunitas ride-sharing lokal ini. Bagikan
              TripNus kepada teman Anda dan jadilah bagian dari masa depan
              transportasi Indonesia.
            </Text>
            <TouchableOpacity
              onPress={onShare}
              className="mt-4 flex-row items-center"
            >
              <Text className="mr-1 font-medium text-blue-600">
                Bagikan TripNus
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
          <View className="ml-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="share-social" size={20} color="#3B82F6" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Index() {
  const { authData } = useContext(AuthContext);
  const router = useRouter();
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [isCheckingActiveRide, setIsCheckingActiveRide] = useState(false);

  // Load profile picture
  const refreshProfilePicture = async () => {
    if (authData?.user.id) {
      const uri = await getProfilePictureUri(authData.user.id);
      setProfilePictureUri(uri);
    }
  };

  // Check for active ride
  const checkActiveRide = useCallback(async () => {
    if (!authData?.session.access_token) return;

    try {
      const response = await getActiveRide(authData.session.access_token);
      setHasActiveRide(!!response?.data);
    } catch (error) {
      console.error('Error checking active ride:', error);
    }
  }, [authData]);

  // Handle active ride button press
  const handleActiveRidePress = async () => {
    if (isCheckingActiveRide) return;
    router.push('/active-ride/ride-details');
  };

  // Simplified search press handler
  const handleSearchPress = () => {
    try {
      setIsLoading(true);
      router.push('/ride-request');
    } catch (error) {
      console.error('Error handling search press:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check active ride on mount
  useEffect(() => {
    checkActiveRide();
  }, [checkActiveRide]);

  // Check active ride when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkActiveRide();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkActiveRide]);

  // Check active ride when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkActiveRide();
    }, [checkActiveRide])
  );

  // Set profile picture
  useEffect(() => {
    refreshProfilePicture();
  }, []);

  // Event handlers
  const handleInvite = async () => {
    try {
      const result = await Share.share({
        url: 'https://play.google.com/store/apps/details?id=com.tripnus',
        title: 'Bagikan TripNus',
        message:
          'Bergabunglah dengan saya di TripNus! Aplikasi ride-sharing lokal yang membuat transportasi lebih baik di Indonesia. Unduh sekarang!',
      });

      if (result.action === Share.sharedAction) {
        console.log(
          result.activityType
            ? 'Dibagikan dengan tipe aktivitas: ' + result.activityType
            : 'Berhasil dibagikan'
        );
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
        <Header
          firstName={authData?.riderFirstName || 'Teman'}
          profilePictureUri={profilePictureUri}
          onProfilePress={handleProfilePress}
        />

        <StatsSection />

        {hasActiveRide ? (
          <View className="mt-2 px-4">
            <TouchableOpacity
              onPress={handleActiveRidePress}
              disabled={isCheckingActiveRide}
              className="h-14 flex-row items-center justify-center rounded-xl bg-blue-600 px-4 disabled:opacity-50"
            >
              {isCheckingActiveRide ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color="white" />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Lihat Perjalanan Aktif
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <SearchBar onPress={handleSearchPress} isLoading={isLoading} />
          </View>
        )}

        <View className="mt-4 px-4">
          <Text className="text-center text-gray-500">
            TripNus — Perjalanan cepat, aman, dan terpercaya
          </Text>
        </View>

        <View className="mb-6 mt-8 px-4">
          <View className="h-[1px] bg-gray-300" />
        </View>

        <CommunitySupport onShare={handleInvite} />

        {DEBUG_MODE && <NotificationDebug />}

        <View className="h-8" />
      </ScrollView>
    </SafeView>
  );
}
