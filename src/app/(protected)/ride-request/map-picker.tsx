import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import {
  LocationBottomSheet,
  MapPickerHeader,
} from '@/features/ride-request/components/map-picker/';
import {
  useLocationDetails,
  useLocationStore,
  useMapInteraction,
} from '@/features/ride-request/hooks';
import { type Coordinates } from '@/features/ride-request/types';
import { SafeView } from '@/lib/safe-view';

export default function MapPicker() {
  const router = useRouter();
  const { type, initialLatitude, initialLongitude } = useLocalSearchParams();

  const initialCoordinates: Coordinates = {
    latitude: parseFloat(initialLatitude as string) || -6.2088,
    longitude: parseFloat(initialLongitude as string) || 106.8456,
  };

  const {
    mapRef,
    selectedLocation,
    isMapMoving,
    isMapReady,
    handleMapReady,
    handleRegionChangeComplete,
    handleRegionChange,
    handleMyLocation,
  } = useMapInteraction(initialCoordinates);

  const { locationDetail, isLoading, fetchLocationDetails } =
    useLocationDetails();

  // Fetch location details when map stops moving
  useEffect(() => {
    if (isMapReady && !isMapMoving) {
      const timer = setTimeout(() => {
        fetchLocationDetails(selectedLocation);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation, isMapMoving, fetchLocationDetails, isMapReady]);

  const handleConfirm = () => {
    if (locationDetail) {
      useLocationStore.getState().setSelectedMapLocation(
        {
          ...locationDetail,
          coordinates: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          },
        },
        type as string
      );
      router.back();
    }
  };

  return (
    <SafeView>
      <View className="flex-1 bg-gray-50">
        <MapPickerHeader router={router} type={type as string} />

        {/* Map Container */}
        <View className="relative flex-1">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation
            showsMyLocationButton={false}
            initialRegion={{
              ...initialCoordinates,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onMapReady={() => {
              handleMapReady();
              fetchLocationDetails(selectedLocation);
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
            onRegionChange={handleRegionChange}
          />

          {/* Center Fixed Marker */}
          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center"
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={40}
              color={type === 'pickup' ? '#3B82F6' : '#EF4444'}
            />
          </View>

          {/* My Location Button */}
          <TouchableOpacity
            onPress={() => handleMyLocation(selectedLocation)}
            className="absolute right-4 top-4 h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="locate" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <LocationBottomSheet
          isMapReady={isMapReady}
          isLoading={isLoading}
          isMapMoving={isMapMoving}
          locationDetail={locationDetail}
          type={type as string}
          onConfirm={handleConfirm}
        />
      </View>
    </SafeView>
  );
}
