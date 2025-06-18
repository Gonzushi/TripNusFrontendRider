import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  AnimatedRegion,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddressCard } from '@/features/fare-calculation/components';
import { AuthContext } from '@/lib/auth';
import {
  type LocationWithHeading,
  webSocketService,
} from '@/lib/background/websocket-service';
import { SUPABASE_STORAGE_URL } from '@/lib/profile-picture/constants';
import { getActiveRide } from '@/lib/ride/api';
import { useRideStore } from '@/lib/ride/store';
import { type RideData, type RideStatus } from '@/lib/ride/types';
import { SafeView } from '@/lib/safe-view';

import { DebugConsole } from './debug-console';

type Location = { latitude: number; longitude: number };

// Constants
const DEBUG_MODE = true;
const MAP_EDGE_PADDING = {
  top: 200,
  right: 50,
  bottom: 110,
  left: 50,
};

// Helper Functions
const isActiveRideStatus = (status: RideStatus | null | undefined) => {
  return ['driver_accepted', 'driver_arrived', 'in_progress'].includes(
    status as RideStatus
  );
};

async function openWhatsApp(phoneNumber: string) {
  try {
    const phone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      'Halo, saya penumpang TripNus. Titik jemput dan tujuan saya sudah sesuai ya. Terima kasih!'
    );
    const whatsappUrl = `whatsapp://send?phone=${phone}&text=${message}`;
    const waMeUrl = `https://wa.me/${phone}?text=${message}`;

    const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
    if (canOpenWhatsApp) {
      await Linking.openURL(whatsappUrl);
      return;
    }

    const canOpenWaMe = await Linking.canOpenURL(waMeUrl);
    if (canOpenWaMe) {
      await Linking.openURL(waMeUrl);
      return;
    }

    Alert.alert(
      'Error',
      'Tidak dapat membuka WhatsApp. Silakan coba lagi nanti.'
    );
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    Alert.alert(
      'Error',
      'Tidak dapat membuka WhatsApp. Silakan coba lagi nanti.'
    );
  }
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistanceInKm(from: Location, to: Location): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(to.latitude - from.latitude);
  const dLon = deg2rad(to.longitude - from.longitude);

  const lat1 = deg2rad(from.latitude);
  const lat2 = deg2rad(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const SkeletonLoader = () => {
  const opacity = useSharedValue(0.3);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeView
      isShowingTabBar={false}
      isShowingPaddingTop={false}
      statusBarStyle="light"
      statusBackgroundColor="bg-blue-600"
    >
      <View className="flex-1 bg-white">
        {/* Address Card Skeleton */}
        <View
          className="absolute left-4 right-4 z-10"
          style={{ top: insets.top + 10 }}
        >
          <View className="flex-row items-center space-x-3">
            {/* Back Button */}
            <Animated.View
              className="my-6 mr-3 h-[34px] w-[34px] self-start rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm"
              style={animatedStyle}
            />

            {/* Address Container */}
            <View className="flex-1 rounded-xl bg-white px-3 py-2.5 shadow-sm">
              <View className="flex-row items-center space-x-3">
                {/* Dots and Line */}
                <View
                  className="ml-2 mr-4 justify-between"
                  style={{ width: 12, height: 62 }}
                >
                  <Animated.View
                    className="mx-auto mt-2.5 h-3 w-3 rounded-full bg-gray-200"
                    style={animatedStyle}
                  />
                  <Animated.View
                    className="absolute left-[5.5px] top-3 h-[44px] w-[1px] bg-gray-200"
                    style={animatedStyle}
                  />
                  <Animated.View
                    className="mx-auto mb-2.5 h-3 w-3 rounded-full bg-gray-200"
                    style={animatedStyle}
                  />
                </View>

                {/* Address Text Areas */}
                <View className="flex-1 space-y-2">
                  <View className="border-b border-gray-100 pb-2">
                    <Animated.View
                      className="h-[18px] w-full rounded-md bg-gray-200"
                      style={animatedStyle}
                    />
                  </View>
                  <View className="pt-2">
                    <Animated.View
                      className="h-[18px] w-full rounded-md bg-gray-200"
                      style={animatedStyle}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Map Skeleton */}
        <View className="relative flex-1">
          <Animated.View
            className="h-full w-full bg-gray-200"
            style={animatedStyle}
          />
          {/* Map Control Buttons Skeleton */}
          <View className="absolute bottom-4 right-4 flex-row gap-1">
            {[1, 2, 3, 4].map((_, index) => (
              <Animated.View
                key={index}
                className="h-12 w-12 rounded-full bg-gray-300"
                style={animatedStyle}
              />
            ))}
          </View>
        </View>

        {/* Status Bar Skeleton */}
        <Animated.View
          className="flex-row items-center border-y border-green-200 bg-green-50 px-4 py-2"
          style={animatedStyle}
        >
          <Animated.View
            className="h-5 w-48 rounded-md bg-green-200"
            style={animatedStyle}
          />
        </Animated.View>

        {/* Driver Card Skeleton */}
        <View className="border-b border-gray-200 bg-white px-4 py-5">
          <Animated.View
            className="mb-4 h-5 w-40 rounded-md bg-gray-200"
            style={animatedStyle}
          />

          <View className="flex-row items-start justify-between gap-4">
            {/* Profile Picture */}
            <Animated.View
              className="mt-1 h-16 w-16 rounded-full bg-gray-200"
              style={animatedStyle}
            />

            {/* Driver Info */}
            <View className="flex-1">
              <Animated.View
                className="h-6 w-40 rounded-md bg-gray-200"
                style={animatedStyle}
              />
              <View className="mt-1 flex-row items-center gap-1">
                <Animated.View
                  className="h-4 w-4 rounded-full bg-gray-200"
                  style={animatedStyle}
                />
                <Animated.View
                  className="h-4 w-24 rounded-md bg-gray-200"
                  style={animatedStyle}
                />
              </View>
              <Animated.View
                className="mt-1 h-4 w-48 rounded-md bg-gray-200"
                style={animatedStyle}
              />
            </View>

            {/* Contact Buttons */}
            <View className="flex-row gap-2">
              <Animated.View
                className="h-9 w-9 rounded-full bg-gray-200"
                style={animatedStyle}
              />
              <Animated.View
                className="h-9 w-9 rounded-full bg-gray-200"
                style={animatedStyle}
              />
            </View>
          </View>

          {/* License Plate */}
          <View className="mt-3 items-center">
            <View className="w-full items-center rounded-xl bg-blue-50 py-2">
              <Animated.View
                className="h-8 w-32 rounded-md bg-gray-200"
                style={animatedStyle}
              />
              <Animated.View
                className="mt-1 h-3 w-16 rounded-md bg-gray-200"
                style={animatedStyle}
              />
            </View>
          </View>
        </View>

        {/* Cancel Button Skeleton */}
        <View className="mb-6 px-4 py-4">
          <Animated.View
            className="h-14 w-full rounded-xl bg-gray-200"
            style={animatedStyle}
          />
        </View>
      </View>
    </SafeView>
  );
};

export default function RideDetails() {
  const router = useRouter();
  const { authData } = useContext(AuthContext);
  const { rideData, setRideData, rideStatus, setRideStatus } = useRideStore();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [heading, setHeading] = useState(0);
  const [pickupTime, setPickupTime] = useState(0);
  const [driverPosition, setDriverPosition] = useState<AnimatedRegion | null>(
    null
  );

  // Refs
  const mapRef = useRef<MapView | null>(null);
  const driverPositionRef = useRef<AnimatedRegion | null>(null);

  // Fetch Ride Details
  const fetchRideDetails = async () => {
    try {
      setIsLoading(true);

      // Artificial delay for testing loading state (0.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await getActiveRide(authData!.session.access_token);
      if (response?.data) {
        setRideData(response.data);
        setRideStatus(response.data.status);

        // Initialize driver position immediately if we have driver location
        if (response.data.driverLocation) {
          const initialPosition = new AnimatedRegion({
            latitude: response.data.driverLocation.latitude,
            longitude: response.data.driverLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setDriverPosition(initialPosition);
          setHeading(response.data.driverLocation.heading_deg ?? 0);
        } else if (response.data.planned_pickup_coords) {
          // Fallback to pickup location if no driver location
          const initialPosition = new AnimatedRegion({
            latitude: response.data.planned_pickup_coords.coordinates[1],
            longitude: response.data.planned_pickup_coords.coordinates[0],
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setDriverPosition(initialPosition);
          setHeading(0);
        }
        return response.data;
      } else {
        setRideData(null);
        setRideStatus(null);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      Alert.alert('Error', 'Gagal memuat data perjalanan');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Location update handler
  const handleLocationUpdate = useCallback(
    (location: LocationWithHeading) => {
      if (!rideData || !driverPositionRef.current) {
        return;
      }

      const distanceToPickupKm = getDistanceInKm(
        { latitude: location.latitude, longitude: location.longitude },
        {
          latitude: rideData.planned_pickup_coords.coordinates[1],
          longitude: rideData.planned_pickup_coords.coordinates[0],
        }
      );

      // Calculate pickup time based on current speed
      const estimatedSpeed = 20; // km/h default speed
      const pickupTime = Math.ceil((distanceToPickupKm / estimatedSpeed) * 60);

      setPickupTime(pickupTime);
      setHeading(location.heading_deg);

      // Update driver position with animation
      driverPositionRef.current
        .timing({
          toValue: {
            x: location.latitude,
            y: location.longitude,
          },
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
          duration: 1000,
          useNativeDriver: false,
        })
        .start();
    },
    [rideData]
  );

  // Effects
  useEffect(() => {
    driverPositionRef.current = driverPosition;
  }, [driverPosition]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        console.log('🖥️  Fetching ride details');
        await webSocketService.connect(authData!.riderId);
        const newRideData = await fetchRideDetails();

        if (
          isActive &&
          isActiveRideStatus(newRideData?.status) &&
          newRideData?.drivers?.id
        ) {
          await webSocketService.unsubscribeFromDriver();
          await webSocketService.subscribeToDriver(newRideData?.drivers?.id);
          webSocketService.addDriverLocationListener(handleLocationUpdate);
        }
      };

      run();

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') run();
      });

      return () => {
        isActive = false;
        webSocketService.unsubscribeFromDriver().catch(console.error);
        webSocketService.removeDriverLocationListener(handleLocationUpdate);
        subscription.remove();
      };
    }, [rideStatus])
  );

  // Map control handlers
  const handleFollowDriver = useCallback(() => {
    if (!rideData) return;
    if (!mapRef.current) return;

    const pickupCoords = {
      latitude: rideData.planned_pickup_coords.coordinates[1],
      longitude: rideData.planned_pickup_coords.coordinates[0],
    };
    const dropoffCoords = {
      latitude: rideData.planned_dropoff_coords.coordinates[1],
      longitude: rideData.planned_dropoff_coords.coordinates[0],
    };

    let currentDriverPosition = pickupCoords;

    if (driverPositionRef.current) {
      currentDriverPosition =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (driverPositionRef.current as any).__getValue();
    }

    let coordsToFit = [];
    switch (rideStatus) {
      case 'driver_accepted':
      case 'driver_arrived':
        coordsToFit = [pickupCoords, currentDriverPosition];
        break;
      case 'in_progress':
        coordsToFit = [dropoffCoords, currentDriverPosition];
        break;
      default:
        return;
    }

    mapRef.current.fitToCoordinates(coordsToFit, {
      edgePadding: MAP_EDGE_PADDING,
      animated: true,
    });
  }, [rideStatus]);

  const handleShowAll = useCallback(() => {
    if (!rideData) return;
    if (!mapRef.current) return;

    const pickupCoords = {
      latitude: rideData.planned_pickup_coords.coordinates[1],
      longitude: rideData.planned_pickup_coords.coordinates[0],
    };
    const dropoffCoords = {
      latitude: rideData.planned_dropoff_coords.coordinates[1],
      longitude: rideData.planned_dropoff_coords.coordinates[0],
    };

    let currentDriverPosition = pickupCoords;

    if (driverPositionRef.current) {
      currentDriverPosition =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (driverPositionRef.current as any).__getValue();
    }

    mapRef.current.fitToCoordinates(
      [pickupCoords, dropoffCoords, currentDriverPosition],
      {
        edgePadding: MAP_EDGE_PADDING,
        animated: true,
      }
    );
  }, [rideData]);

  const handleViewPickup = () => {
    if (!rideData || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: rideData.planned_pickup_coords.coordinates[1],
        longitude: rideData.planned_pickup_coords.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  const handleViewDropoff = () => {
    if (!rideData || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: rideData.planned_dropoff_coords.coordinates[1],
        longitude: rideData.planned_dropoff_coords.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  // Effect to handle ride status changes
  useEffect(() => {
    if (!rideStatus || !rideData) return;

    switch (rideStatus) {
      case 'searching':
      case 'requesting_driver':
        handleShowAll();
        break;
      case 'driver_accepted':
      case 'driver_arrived':
      case 'in_progress':
        handleFollowDriver();
        break;
      default:
        handleShowAll();
        break;
    }
  }, [rideStatus, rideData, handleShowAll, handleFollowDriver]);

  // Animation setup for skeleton loading
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Handle
  const handleCancelRide = () => {
    console.log('❌ Cancel ride');
  };

  // Render Function
  const renderStatusBar = () => {
    if (!rideData) return null;

    switch (rideStatus) {
      case 'searching':
      case 'requesting_driver':
        return (
          <View className="flex-row items-center border-y border-blue-200 bg-blue-50 px-4 py-2">
            <MaterialCommunityIcons name="magnify" size={20} color="#1D4ED8" />
            <Text className="ml-2 text-sm font-medium text-blue-800">
              Mencari pengemudi terdekat...
            </Text>
          </View>
        );
      case 'driver_accepted':
        return (
          <View className="flex-row items-center border-y border-green-200 bg-green-50 px-4 py-2">
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#166534"
            />
            <Text className="ml-2 text-sm font-medium text-green-800">
              {pickupTime > 0
                ? `Pengemudi akan tiba dalam ${pickupTime} menit`
                : 'Pengemudi sedang dalam perjalanan'}
            </Text>
          </View>
        );
      case 'driver_arrived':
        return (
          <View className="flex-row items-center border-y border-green-200 bg-green-50 px-4 py-2">
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#166534"
            />
            <Text className="ml-2 text-sm font-medium text-green-800">
              Pengemudi sudah tiba
            </Text>
          </View>
        );
      case 'in_progress':
        return (
          <View className="flex-row items-center border-y border-green-200 bg-green-50 px-4 py-2">
            <MaterialCommunityIcons name="car" size={20} color="#166534" />
            <Text className="ml-2 text-sm font-medium text-green-800">
              Dalam perjalanan ke tujuan
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderDriverInfo = (driver: NonNullable<RideData['drivers']>) => {
    return (
      <>
        {/* Profile Picture */}
        <Image
          source={{
            uri: `${SUPABASE_STORAGE_URL}/${driver.profile_picture_url}`,
          }}
          className="mt-1 h-16 w-16 rounded-full bg-gray-200"
        />

        {/* Driver Info */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {driver.first_name} {driver.last_name}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text className="text-sm font-medium text-gray-900">
              {driver.rating.toFixed(1)}
            </Text>
            <Text className="ml-1 text-sm text-gray-500">
              ({driver.completed_rides ?? 0} rides)
            </Text>
          </View>
          <Text className="mt-0.5 text-sm text-gray-500">
            {driver.vehicle_brand} {driver.vehicle_model} •{' '}
            {driver.vehicle_color}
          </Text>
        </View>

        {/* Contact Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${driver.users.phone}`)}
            className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
            accessibilityLabel="Call Driver"
          >
            <Ionicons name="call" size={18} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await openWhatsApp(driver.users.phone);
            }}
            className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
            accessibilityLabel="WhatsApp Driver"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderDriverSkeleton = () => {
    return (
      <>
        {/* Profile Picture Skeleton */}
        <Animated.View
          className="mt-1 h-16 w-16 rounded-full bg-gray-200"
          style={animatedStyle}
        />

        {/* Driver Info Skeleton */}
        <View className="flex-1">
          <Animated.View
            className="h-6 w-40 rounded-md bg-gray-200"
            style={animatedStyle}
          />
          <View className="mt-1 flex-row items-center gap-1">
            <Animated.View
              className="h-4 w-4 rounded-full bg-gray-200"
              style={animatedStyle}
            />
            <Animated.View
              className="h-4 w-24 rounded-md bg-gray-200"
              style={animatedStyle}
            />
          </View>
          <Animated.View
            className="mt-1 h-4 w-48 rounded-md bg-gray-200"
            style={animatedStyle}
          />
        </View>

        {/* Contact Buttons Skeleton */}
        <View className="flex-row gap-2">
          <Animated.View
            className="h-9 w-9 rounded-full bg-gray-200"
            style={animatedStyle}
          />
          <Animated.View
            className="h-9 w-9 rounded-full bg-gray-200"
            style={animatedStyle}
          />
        </View>
      </>
    );
  };

  const renderLicensePlateSkeleton = () => {
    return (
      <View className="mt-3 items-center">
        <View className="w-full items-center rounded-xl bg-blue-50 py-2">
          <Animated.View
            className="h-8 w-32 rounded-md bg-gray-200"
            style={animatedStyle}
          />
          <Animated.View
            className="mt-1 h-3 w-16 rounded-md bg-gray-200"
            style={animatedStyle}
          />
        </View>
      </View>
    );
  };

  const renderBottomContent = () => {
    if (!rideData) return null;

    switch (rideStatus) {
      case 'searching':
      case 'requesting_driver':
        return (
          <View className="border-t border-gray-200 bg-white px-4 py-5">
            <View className="items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-4 text-base font-medium text-gray-900">
                Mencari Pengemudi
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500">
                Mohon tunggu sebentar, kami sedang mencarikan pengemudi terbaik
                untuk Anda
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Batalkan Pencarian?',
                    'Apakah kamu yakin ingin membatalkan pencarian pengemudi?',
                    [
                      { text: 'Tidak', style: 'cancel' },
                      {
                        text: 'Ya, Batalkan',
                        onPress: handleCancelRide,
                        style: 'destructive',
                      },
                    ]
                  )
                }
                className="mb-6 mt-6 h-14 w-full items-center justify-center rounded-xl bg-red-500"
              >
                <Text className="text-base font-semibold text-white">
                  Batalkan Pencarian
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'driver_accepted':
      case 'driver_arrived':
      case 'in_progress': {
        const driver = rideData.drivers;
        const showCancelButton = rideStatus === 'driver_accepted';
        const containerClass = showCancelButton
          ? 'border-b border-gray-200 bg-white px-4 py-5'
          : 'mb-6 bg-white px-4 py-5';

        return (
          <>
            <View className={containerClass}>
              <Text className="mb-4 text-base font-semibold text-gray-900">
                Informasi Pengemudi
              </Text>
              <View className="flex-row items-start justify-between gap-4">
                {driver ? renderDriverInfo(driver) : renderDriverSkeleton()}
              </View>

              {/* License Plate */}
              {driver ? (
                <View className="mt-3 items-center">
                  <View className="w-full items-center rounded-xl bg-blue-50 py-2">
                    <Text className="text-xl font-extrabold tracking-widest text-gray-900">
                      {driver.vehicle_plate_number.replace(
                        /([A-Z])(\d+)([A-Z])/,
                        '$1 $2 $3'
                      )}
                    </Text>
                    <Text className="mt-1 text-xs font-medium text-gray-400">
                      Plat Nomor
                    </Text>
                  </View>
                </View>
              ) : (
                renderLicensePlateSkeleton()
              )}
            </View>

            {/* Cancel Button - Only show in driver_accepted state */}
            {showCancelButton && (
              <View className="mb-6 px-4 py-4">
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Batalkan Perjalanan?',
                      'Apakah kamu yakin ingin membatalkan perjalanan ini?',
                      [
                        { text: 'Tidak', style: 'cancel' },
                        {
                          text: 'Ya, Batalkan',
                          onPress: handleCancelRide,
                          style: 'destructive',
                        },
                      ]
                    )
                  }
                  className="h-14 w-full items-center justify-center rounded-xl bg-red-500"
                >
                  <Text className="text-base font-semibold text-white">
                    Batalkan Perjalanan
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  const renderMapControls = () => {
    if (!rideData) return null;

    return (
      <View className="absolute bottom-4 right-4 flex-row gap-1">
        {/* Pickup Button - Always visible */}
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
          onPress={handleViewPickup}
        >
          <MaterialCommunityIcons name="map-marker" size={24} color="#3B82F6" />
        </TouchableOpacity>

        {/* Dropoff Button - Always visible */}
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
          onPress={handleViewDropoff}
        >
          <MaterialCommunityIcons name="map-marker" size={24} color="#EF4444" />
        </TouchableOpacity>

        {/* Scan Button - Only visible in specific states */}
        {isActiveRideStatus(rideStatus) && (
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
            onPress={() => handleShowAll()}
          >
            <Ionicons name="scan" size={24} color="#3B82F6" />
          </TouchableOpacity>
        )}

        {/* Locate Button - Only visible in specific states */}
        {isActiveRideStatus(rideStatus) && (
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
            onPress={() => handleFollowDriver()}
          >
            <Ionicons name="locate" size={24} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderDriverMarker = () => {
    if (
      !rideData ||
      !isActiveRideStatus(rideStatus) ||
      !rideData.driverLocation ||
      !driverPosition
    )
      return null;

    return (
      <Marker.Animated
        coordinate={driverPosition as unknown as Location}
        anchor={{ x: 0.5, y: 0.5 }}
        flat
        rotation={heading}
        zIndex={1000}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="navigation" size={32} color="#2563eb" />
        </View>
      </Marker.Animated>
    );
  };

  // Loading State
  if (isLoading || !rideData) {
    return <SkeletonLoader />;
  }


  // Coordinates
  const pickupCoords = rideData.planned_pickup_coords.coordinates;
  const dropoffCoords = rideData.planned_dropoff_coords.coordinates;

  return (
    <SafeView
      isShowingTabBar={false}
      isShowingPaddingTop={false}
      statusBarStyle="light"
      statusBackgroundColor="bg-blue-600"
    >
      <View className="flex-1 bg-white">
        {DEBUG_MODE && <DebugConsole />}

        {/* Address Card */}
        <AddressCard
          pickup={{
            latitude: rideData.planned_pickup_coords.coordinates[1],
            longitude: rideData.planned_pickup_coords.coordinates[0],
            address: rideData.planned_pickup_address,
          }}
          dropoff={{
            latitude: rideData.planned_dropoff_coords.coordinates[1],
            longitude: rideData.planned_dropoff_coords.coordinates[0],
            address: rideData.planned_dropoff_address,
          }}
          onBack={() => router.back()}
        />

        {/* Map */}
        <View className="flex-1">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ height: '100%', width: '100%' }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {/* Pickup Marker */}
            <Marker
              coordinate={{
                latitude: pickupCoords[1],
                longitude: pickupCoords[0],
              }}
              title="Pickup Location"
              description={rideData.planned_pickup_address}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={40}
                color="#3B82F6"
              />
            </Marker>

            {/* Dropoff Marker */}
            <Marker
              coordinate={{
                latitude: dropoffCoords[1],
                longitude: dropoffCoords[0],
              }}
              title="Dropoff Location"
              description={rideData.planned_dropoff_address}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={40}
                color="#EF4444"
              />
            </Marker>

            {/* Driver Location Marker - Only show when we have a driver and their location */}
            {renderDriverMarker()}
          </MapView>

          {/* Map Control Buttons */}
          {renderMapControls()}
        </View>

        {/* Status Bar */}
        {renderStatusBar()}

        {/* Bottom Content */}
        {renderBottomContent()}
      </View>
    </SafeView>
  );
}
