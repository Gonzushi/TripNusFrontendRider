import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import {
  type LatLng,
  webSocketService,
} from '@/lib/background/websocket-service';
import { SUPABASE_STORAGE_URL } from '@/lib/profile-picture/constants';
import { type RideData } from '@/lib/ride/types';
import { SafeView } from '@/lib/safe-view';

export default function RideDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string }>();
  const rideData: RideData = JSON.parse(params.data);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFollowingDriver, setIsFollowingDriver] = useState(true);

  const mapRef = useRef<MapView | null>(null);
  const hasInitializedMap = useRef(false);

  // Activate websocket when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setupWebSocket();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [rideData.drivers.id]);

  // Activate websocket when screen is focused
  useFocusEffect(
    useCallback(() => {
      setupWebSocket();

      return () => {
        cleanupWebSocket();
      };
    }, [rideData.drivers.id])
  );

  // Activate websocket when component mounts or rideData.drivers.id changes
  useEffect(() => {
    setupWebSocket();

    return () => {
      cleanupWebSocket();
    };
  }, [rideData.drivers.id]);

  // Shared location update handler
  const handleLocationUpdate = (location: LatLng) => {
    setDriverLocation(location);

    // Update map to follow driver if following is enabled
    if (isFollowingDriver && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...location,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    }
  };

  // Subscribe & listen
  const setupWebSocket = async () => {
    try {
      await webSocketService.unsubscribeFromDriver();
      await webSocketService.subscribeToDriver(rideData.drivers.id);
      webSocketService.addDriverLocationListener(handleLocationUpdate);
    } catch (err) {
      console.error('WebSocket setup error:', err);
    }
  };

  // Unsubscribe & clean up
  const cleanupWebSocket = async () => {
    try {
      await webSocketService.unsubscribeFromDriver();
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    }
    webSocketService.removeDriverLocationListener(handleLocationUpdate);
  };

  // Initial map setup
  useEffect(() => {
    if (
      !mapRef.current ||
      !rideData ||
      !driverLocation ||
      hasInitializedMap.current
    )
      return;

    const pickupCoords = rideData.planned_pickup_coords.coordinates;
    const dropoffCoords = rideData.planned_dropoff_coords.coordinates;

    mapRef.current.fitToCoordinates(
      [
        { latitude: pickupCoords[1], longitude: pickupCoords[0] },
        { latitude: dropoffCoords[1], longitude: dropoffCoords[0] },
        driverLocation,
      ],
      {
        edgePadding: { top: 130, right: 50, bottom: 50, left: 50 },
        animated: true,
      }
    );
    hasInitializedMap.current = true;
  }, [rideData, driverLocation]);

  const openWhatsApp = async (phoneNumber: string) => {
    try {
      // Remove any non-numeric characters from the phone number
      const phone = phoneNumber.replace(/\D/g, '');

      const message = encodeURIComponent(
        'Halo, saya penumpang TripNus. Titik jemput dan tujuan saya sudah sesuai ya. Terima kasih!'
      );
      const whatsappUrl = `whatsapp://send?phone=${phone}&text=${message}`;
      const waMeUrl = `https://wa.me/${phone}?text=${message}`;

      // First try to open WhatsApp app
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);

      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        // If WhatsApp app is not installed, open in browser
        const canOpenWaMe = await Linking.canOpenURL(waMeUrl);
        if (canOpenWaMe) {
          await Linking.openURL(waMeUrl);
        } else {
          Alert.alert(
            'Error',
            'Tidak dapat membuka WhatsApp. Silakan coba lagi nanti.'
          );
        }
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert(
        'Error',
        'Tidak dapat membuka WhatsApp. Silakan coba lagi nanti.'
      );
    }
  };

  if (!rideData) {
    return (
      <SafeView
        isShowingTabBar={false}
        isShowingPaddingTop
        statusBarStyle="light"
        statusBackgroundColor="bg-blue-600"
      >
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-lg text-gray-900">No active ride found</Text>
        </View>
      </SafeView>
    );
  }

  const pickupCoords = rideData.planned_pickup_coords.coordinates;
  const dropoffCoords = rideData.planned_dropoff_coords.coordinates;

  return (
    <SafeView
      isShowingTabBar={false}
      isShowingPaddingTop
      statusBarStyle="light"
      statusBackgroundColor="bg-blue-600"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="-mb-4 bg-blue-600 px-4 pb-12 pt-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="mb-1 text-xl font-bold text-white">
                Perjalanan Aktif
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="-mt-4 flex-1 rounded-t-3xl bg-white py-3"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Map */}
          <View className="-mt-4 h-[50vh] w-full overflow-hidden rounded-2xl border border-blue-300 shadow-sm">
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

              {/* Driver Location Marker */}
              {driverLocation && (
                <Marker coordinate={driverLocation} title="Driver Location">
                  <View className="items-center justify-center">
                    <MaterialCommunityIcons
                      name="car"
                      size={32}
                      color="#3B82F6"
                    />
                  </View>
                </Marker>
              )}
            </MapView>

            {/* Map Control Buttons */}
            <View className="absolute right-4 top-4 flex-row gap-1">
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
                onPress={() => {
                  if (mapRef.current) {
                    setIsFollowingDriver(false);
                    mapRef.current.animateToRegion(
                      {
                        latitude: pickupCoords[1],
                        longitude: pickupCoords[0],
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      },
                      1000
                    );
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#3B82F6"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
                onPress={() => {
                  if (mapRef.current) {
                    setIsFollowingDriver(false);
                    mapRef.current.animateToRegion(
                      {
                        latitude: dropoffCoords[1],
                        longitude: dropoffCoords[0],
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      },
                      1000
                    );
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#EF4444"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
                onPress={() => {
                  setIsFollowingDriver(false);
                  if (mapRef.current && driverLocation) {
                    mapRef.current.fitToCoordinates(
                      [
                        {
                          latitude: pickupCoords[1],
                          longitude: pickupCoords[0],
                        },
                        {
                          latitude: dropoffCoords[1],
                          longitude: dropoffCoords[0],
                        },
                        driverLocation,
                      ],
                      {
                        edgePadding: {
                          top: 130,
                          right: 50,
                          bottom: 50,
                          left: 50,
                        },
                        animated: true,
                      }
                    );
                  }
                }}
              >
                <Ionicons name="scan" size={24} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
                onPress={() => {
                  if (mapRef.current && driverLocation) {
                    setIsFollowingDriver(true);
                    mapRef.current.animateToRegion(
                      {
                        ...driverLocation,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      },
                      1000
                    );
                  }
                }}
              >
                <Ionicons name="locate" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6">
            {/* Driver Card */}
            <View className="mt-8 rounded-2xl border border-blue-200 bg-blue-100 p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold text-gray-900">
                Informasi Pengemudi
              </Text>
              <View className="flex-row items-center gap-4">
                <Image
                  source={{
                    uri: `${SUPABASE_STORAGE_URL}/${rideData.drivers.profile_picture_url}`,
                  }}
                  className="h-16 w-16 rounded-full bg-gray-200"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {rideData.drivers.first_name} {rideData.drivers.last_name}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-1">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-sm font-medium text-gray-900">
                      {rideData.drivers.rating.toFixed(1)}
                    </Text>
                    <Text className="ml-1 text-sm text-gray-500">
                      ({rideData.drivers.completed_rides ?? 0} rides)
                    </Text>
                  </View>
                  <Text className="mt-1 text-sm text-gray-500">
                    {rideData.drivers.vehicle_brand}{' '}
                    {rideData.drivers.vehicle_model} •{' '}
                    {rideData.drivers.vehicle_color}
                  </Text>
                </View>
              </View>

              {/* License Plate Section */}
              <View className="mt-6 items-center">
                <View className="w-full items-center rounded-xl bg-blue-50 py-4">
                  <Text className="text-2xl font-extrabold tracking-widest text-gray-900">
                    {rideData.drivers.vehicle_plate_number.replace(
                      /([A-Z])(\d+)([A-Z])/,
                      '$1 $2 $3'
                    )}
                  </Text>
                  <Text className="mt-1 text-xs font-medium text-gray-400">
                    Plat Nomor
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Action Buttons */}
            <View className="mt-8 space-y-3">
              <TouchableOpacity
                onPress={() => {}}
                disabled={isCancelling}
                className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 shadow-sm active:bg-red-600"
              >
                {isCancelling ? (
                  <>
                    <ActivityIndicator color="white" />
                    <Text className="font-semibold text-white">
                      Membatalkan...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="font-semibold text-white">
                      Batalkan Perjalanan
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeView>
  );
}
