import { Ionicons } from '@expo/vector-icons';
import { type Href, type Router, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
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

// Debug
function DebugButton({
  router,
  page,
  label,
}: {
  router: Router;
  page: Href;
  label: string;
}) {
  return (
    <View className="mt-4 px-4">
      <TouchableOpacity
        onPress={() => router.push(page)}
        className="flex-row items-center justify-center rounded-xl bg-blue-600 py-4"
      >
        <Ionicons name="car" size={20} color="white" className="mr-2" />
        <Text className="ml-2 text-base font-semibold text-white">{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  value: string;
  label: string;
}) {
  return (
    <View
      className={`w-[31%] rounded-2xl border ${borderColor} ${bgColor} shadow-sm`}
    >
      <View className="px-3 py-4">
        <View
          className={`mb-3 h-11 w-11 items-center justify-center rounded-full ${
            bgColor.replace('bg-', 'bg-') + '/90'
          }`}
        >
          <Ionicons name={icon} size={28} color={iconColor} />
        </View>
        <View>
          <Text className="text-2xl font-bold text-gray-800">{value}</Text>
          <Text className="mt-1 text-[13px] text-gray-600">{label}</Text>
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
        />
        <StatCard
          icon="map"
          iconColor="#8B5CF6"
          bgColor="bg-purple-50"
          borderColor="border-purple-100"
          value="13 km"
          label="Jarak Rata-rata"
        />
        <StatCard
          icon="star"
          iconColor="#EAB308"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-100"
          value="4.9"
          label="Penilaian"
        />
      </View>
    </View>
  );
}

// Search bar component
function SearchBar({ onPress }: { onPress: () => void }) {
  return (
    <View className="mt-2 px-4">
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-4 active:bg-gray-100"
      >
        <Ionicons name="location" size={20} color="#6B7280" />
        <Text className="ml-3 flex-1 text-gray-500">Masukkan tujuan Anda</Text>
        <Ionicons name="search" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}

// Start trip button component
function StartTripButton({ onPress }: { onPress: () => void }) {
  return (
    <View className="mt-4 px-4">
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-center rounded-xl bg-blue-600 py-4"
      >
        <Ionicons name="car" size={20} color="white" className="mr-2" />
        <Text className="ml-2 text-base font-semibold text-white">
          Mulai Perjalanan
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Community support section component
function CommunitySupport({ onShare }: { onShare: () => void }) {
  return (
    <View className="px-4">
      <View className="rounded-xl border border-blue-100/50 bg-blue-50/50 p-5">
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

  // Load profile picture
  const refreshProfilePicture = async () => {
    if (authData?.user.id) {
      const uri = await getProfilePictureUri(authData.user.id);
      setProfilePictureUri(uri);
    }
  };

  useEffect(() => {
    refreshProfilePicture();
  }, [authData?.user.id, authData?.riderProfilePictureUrl]);

  // Event handlers
  const handleSearchPress = async () => {
    const response = await getActiveRide(
      authData!.session.access_token,
      authData!.riderId
    );

    if (response && response.data) {
      router.push({
        pathname: '/active-ride/searching',
        params: {
          data: JSON.stringify(response.data),
        },
      });
    } else {
      router.push('/ride-request');
    }
  };

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
          firstName={authData?.firstName || 'Teman'}
          profilePictureUri={profilePictureUri}
          onProfilePress={handleProfilePress}
        />

        <StatsSection />

        <SearchBar onPress={handleSearchPress} />

        <StartTripButton onPress={handleSearchPress} />

        <DebugButton
          router={router}
          page="/active-ride/driver-found"
          label="Dapat Driver"
        />

        <View className="mt-4 px-4">
          <Text className="text-center text-gray-500">
            TripNus — Perjalanan cepat, aman, dan terpercaya
          </Text>
        </View>

        <View className="mb-6 mt-8 px-4">
          <View className="h-[1px] bg-gray-300" />
        </View>

        <CommunitySupport onShare={handleInvite} />

        <NotificationDebug />

        <View className="h-8" />
      </ScrollView>
    </SafeView>
  );
}
