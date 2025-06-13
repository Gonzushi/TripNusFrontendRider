import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Image, Share, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DriverFound() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView | null>(null);

  const handleShareTrip = async () => {
    try {
      const result = await Share.share({
        message: `I'm on my way! Track my trip here: [Trip Link]`,
        title: 'Share Trip Details',
      });
    } catch (error) {
      console.error('Error sharing trip:', error);
    }
  };

  const handleCancelTrip = () => {
    // TODO: Implement cancel trip logic
    router.back();
  };

  // TODO: Replace with actual driver location from WebSocket/Push Notification
  const driverLocation = {
    latitude: -6.2088,
    longitude: 106.8456,
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-blue-600 px-4 py-3"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white">Driver Found</Text>
        <TouchableOpacity>
          <Text className="text-white">Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View className="h-[45%]">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{
            ...driverLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={driverLocation}>
            <View className="items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <Ionicons name="car" size={24} color="white" />
              </View>
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-6">
        {/* Success Message */}
        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Ionicons name="checkmark" size={32} color="#22C55E" />
          </View>
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            Driver Confirmed!
          </Text>
          <Text className="mt-1 text-center text-gray-600">
            Your driver is on the way to pick you up
          </Text>
          <View className="mt-3 flex-row items-center rounded-full bg-green-50 px-4 py-2">
            <Ionicons name="time" size={16} color="#22C55E" />
            <Text className="ml-2 text-green-700">Arriving in 5-8 minutes</Text>
          </View>
        </View>

        {/* Driver Info Card */}
        <View className="mt-6 rounded-xl border border-gray-100 bg-white p-4">
          <Text className="mb-4 font-semibold text-gray-900">Your Driver</Text>

          <View className="flex-row items-center">
            <Image
              source={{ uri: params.driverPhoto }}
              className="h-14 w-14 rounded-full"
            />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-medium text-gray-900">
                  {params.driverName}
                </Text>
                <View className="ml-2 flex-row items-center">
                  <Ionicons name="star" size={14} color="#EAB308" />
                  <Text className="ml-1 text-sm text-gray-600">
                    {params.driverRating} ({params.totalRides} rides)
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600">
                {params.carModel} • {params.carColor}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-4">
            <View>
              <Text className="text-sm font-medium text-gray-900">
                License Plate
              </Text>
              <Text className="text-lg font-bold text-gray-900">
                {params.licensePlate}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleShareTrip}
              className="rounded-xl bg-blue-600 px-6 py-3"
            >
              <Text className="font-medium text-white">Share Trip Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cancel Button */}
      <View
        className="border-t border-gray-100 bg-white px-4 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          onPress={handleCancelTrip}
          className="w-full rounded-xl bg-red-50 py-4"
        >
          <Text className="text-center font-medium text-red-600">
            Cancel Trip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
