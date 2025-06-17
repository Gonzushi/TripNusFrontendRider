import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth';
import { cancelRideByRiderBeforePickup } from '@/lib/ride/api';
import { type RideResponse } from '@/lib/ride/types';
import { SafeView } from '@/lib/safe-view';

type IconName = 'checkmark' | 'search' | 'person' | 'car';

export default function SearchingDriver() {
  const { authData } = useContext(AuthContext);
  const params = useLocalSearchParams<{ data: string }>();
  const rideData: RideResponse['data'] = JSON.parse(params.data);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isCancelling, setIsCancelling] = useState(false);

  // Animation setup
  const pulseAnim = useSharedValue(1);
  const colorAnim = useSharedValue(0);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.4, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    colorAnim.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: interpolateColor(colorAnim.value, [0, 1], [1, 0.7]),
  }));

  const handleCancelSearch = async () => {
    // Show confirmation prompt first
    Alert.alert(
      'Batalkan Pencarian',
      'Apakah Anda yakin ingin membatalkan pencarian pengemudi?',
      [
        {
          text: 'Tidak',
          style: 'cancel',
        },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              setIsCancelling(true);
              const { error, status } =
                await cancelRideByRiderBeforePickup(
                  authData!.session.access_token,
                  {
                    ride_id: rideData!.id,
                    rider_id: authData!.riderId,
                  }
                );

              if (status === 200) {
                router.back();
              } else if (status === 409) {
                Alert.alert(
                  'Tidak Dapat Dibatalkan',
                  'Pengemudi sudah ditemukan. Silakan minta pengemudi untuk membatalkan perjalanan.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        router.push({
                          pathname: '/active-ride/ride-details',
                          params: { data: params.data },
                        });
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Error',
                  error || 'Gagal membatalkan pencarian. Silakan coba lagi.',
                  [
                    {
                      text: 'Coba Lagi',
                      onPress: handleCancelSearch,
                    },
                    {
                      text: 'Batal',
                      style: 'cancel',
                    },
                  ]
                );
              }
            } catch {
              Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.', [
                {
                  text: 'Coba Lagi',
                  onPress: handleCancelSearch,
                },
                {
                  text: 'Batal',
                  style: 'cancel',
                },
              ]);
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  // Update status cards based on ride status
  const getStatusCards = () => {
    const statuses = [
      {
        id: 'confirmed',
        icon: 'checkmark' as IconName,
        title: 'Permintaan Dikonfirmasi',
        description: 'Perjalanan Anda telah terdaftar dalam sistem',
        isActive: true,
        color: 'green',
      },
      {
        id: 'searching',
        icon: 'search' as IconName,
        title: 'Mencari Pengemudi',
        description: 'Menghubungi pengemudi terdekat...',
        isActive: rideData?.status === 'requesting_driver',
        color: 'blue',
        showLoading: true,
      },
      {
        id: 'found',
        icon: 'person' as IconName,
        title: 'Pengemudi Ditemukan',
        description: 'Pengemudi telah menerima permintaan Anda',
        isActive: rideData?.status === 'driver_accepted',
        color: 'blue',
      },
      {
        id: 'enroute',
        icon: 'car' as IconName,
        title: 'Pengemudi Dalam Perjalanan',
        description: 'Pengemudi sedang menuju lokasi Anda',
        isActive: rideData?.status === 'driver_arrived',
        color: 'blue',
      },
    ];

    return statuses.map((status) => (
      <View
        key={status.id}
        className={`my-1 rounded-2xl border p-4 ${
          status.isActive
            ? `border-${status.color}-100 bg-${status.color}-50`
            : 'border-gray-100 bg-gray-50 opacity-40'
        }`}
      >
        <View className="flex-row items-center">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              status.isActive ? `bg-${status.color}-100` : 'bg-gray-100'
            }`}
          >
            {status.showLoading && status.isActive ? (
              <ActivityIndicator
                size="small"
                color={status.color === 'blue' ? '#2563EB' : '#22C55E'}
              />
            ) : (
              <Ionicons
                name={status.icon}
                size={24}
                color={
                  status.isActive
                    ? status.color === 'blue'
                      ? '#2563EB'
                      : '#22C55E'
                    : '#6B7280'
                }
              />
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text
              className={`font-medium ${
                status.isActive ? `text-${status.color}-800` : 'text-gray-800'
              }`}
            >
              {status.title}
            </Text>
            <Text
              className={`text-sm ${
                status.isActive ? `text-${status.color}-600` : 'text-gray-600'
              }`}
            >
              {status.description}
            </Text>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <SafeView
      isShowingTabBar={false}
      isShowingPaddingTop={true}
      statusBarStyle="light"
      statusBackgroundColor="bg-blue-600"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="-mb-4 bg-blue-600 px-4 pb-16 pt-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1 items-center px-4">
              <Text className="mb-1 text-xl font-bold text-white">
                Mencari Pengemudi
              </Text>
              <Text className="px-4 text-center text-xs text-white/80">
                Mohon tunggu sebentar, kami sedang mencarikan pengemudi untuk
                Anda
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="-mt-4 flex-1 rounded-t-3xl bg-white px-6 py-3"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Pulsing Car Icon Circle */}
          <View className="relative items-center pt-8">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <Animated.View style={animatedIconStyle}>
                <Ionicons name="car" size={40} color="#2563EB" />
              </Animated.View>
            </View>
          </View>

          {/* Status Text */}
          <Text className="mt-6 text-center text-xl font-semibold text-gray-900">
            Mencari Pengemudi
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            Kami sedang menghubungkan Anda dengan pengemudi terdekat
          </Text>

          {/* Estimated Time */}
          <View className="mt-6 rounded-full bg-blue-50 px-6 py-2">
            <View className="flex-row items-center justify-center">
              <Ionicons name="time-outline" size={20} color="#2563EB" />
              <Text className="ml-2 text-blue-600">
                Estimasi waktu tunggu: 2-5 menit
              </Text>
            </View>
          </View>

          {/* Trip Details Card */}
          <View className="mt-8 w-full rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Text className="mb-4 font-semibold text-gray-900">
              Detail Perjalanan
            </Text>

            {/* Route Info */}
            <View className="mt-1 space-y-1.5">
              {/* Pickup Location */}
              <View className="flex-row">
                <View className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                <View className="flex-1 pl-3">
                  <Text
                    className="text-sm font-medium text-gray-900"
                    numberOfLines={1}
                  >
                    {rideData?.planned_pickup_address}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Lokasi Penjemputan
                  </Text>
                </View>
              </View>

              {/* Vertical Line */}
              <View className="ml-[3px] h-4 w-0.5 bg-gray-300" />

              {/* Dropoff Location */}
              <View className="flex-row">
                <View className="mt-1.5 h-2 w-2 rounded-full bg-red-500" />
                <View className="flex-1 pl-3">
                  <Text
                    className="text-sm font-medium text-gray-900"
                    numberOfLines={1}
                  >
                    {rideData?.planned_dropoff_address}
                  </Text>
                  <Text className="text-xs text-gray-500">Lokasi Tujuan</Text>
                </View>
              </View>
            </View>

            {/* Trip Info */}
            <View className="mt-4 flex-row justify-between border-t border-blue-200 pt-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  Rp {rideData?.fare?.toLocaleString('id-ID')}
                </Text>
                <Text className="text-sm text-gray-500">Estimasi Biaya</Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  {Math.round((rideData?.duration_s || 0) / 60)} min
                </Text>
                <Text className="text-sm text-gray-500">Durasi Perjalanan</Text>
              </View>
            </View>
          </View>

          {/* Status Updates Cards */}
          <View className="mt-8 space-y-4">{getStatusCards()}</View>
        </ScrollView>

        {/* Cancel Button */}
        <View
          className="border-t border-gray-100 bg-white px-4 py-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            onPress={handleCancelSearch}
            disabled={isCancelling}
            className="w-full rounded-xl border border-red-100 bg-red-50 py-4"
          >
            <View className="flex-row items-center justify-center">
              {isCancelling && (
                <ActivityIndicator
                  size="small"
                  color="#DC2626"
                  className="mr-2"
                />
              )}
              <Text className="text-center font-medium text-red-600">
                Batalkan Pencarian
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeView>
  );
}
