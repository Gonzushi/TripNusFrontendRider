import { useLocationStore } from '@/store/useLocationStore';
import { LocationDetail } from '@/types/location';
import SafeView from '@/utils/safeView';
import Env from '@env';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// Get Google Maps API key from environment variables
const GOOGLE_API_KEY = Env.GOOGLE_API_KEY;

// Debug mode flag
const dev = false;

export default function MapPicker() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { type, initialLatitude, initialLongitude } = useLocalSearchParams();
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: parseFloat(initialLatitude as string) || -6.2088,
    longitude: parseFloat(initialLongitude as string) || 106.8456,
  });
  const [locationDetail, setLocationDetail] = useState<LocationDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fetch location details using Google's Geocoding API
  const fetchLocationDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedLocation.latitude},${selectedLocation.longitude}&key=${GOOGLE_API_KEY}`
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        setLocationDetail({
          title: result.formatted_address.split(',')[0],
          address: result.formatted_address,
          coordinates: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation]);

  // Debounce location fetch while map is moving
  useEffect(() => {
    if (isMapReady && !isMapMoving) {
      const timer = setTimeout(() => {
        fetchLocationDetails();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation, isMapMoving, fetchLocationDetails, isMapReady]);

  const handleConfirm = () => {
    if (locationDetail) {
      // Set the location data in the store
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
      // Navigate back
      router.back();
    }
  };

  const handleMyLocation = async () => {
    if (mapRef.current && locationDetail?.coordinates) {
      mapRef.current.animateToRegion({
        latitude: locationDetail.coordinates.latitude,
        longitude: locationDetail.coordinates.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  return (
    <SafeView>
      <View className="flex-1 bg-gray-50">
        {/* Debug Info */}
        {dev && (
          <View className="absolute top-20 left-4 z-50 bg-black/80 p-4 rounded-lg max-w-[300px]">
            <Text className="text-white font-mono text-xs mb-2">
              Debug Info:
            </Text>

            <Text className="text-white font-mono text-xs mb-1">States:</Text>
            <Text className="text-white font-mono text-xs">
              • isLoading: {String(isLoading)}
            </Text>
            <Text className="text-white font-mono text-xs">
              • isMapMoving: {String(isMapMoving)}
            </Text>
            <Text className="text-white font-mono text-xs">
              • isMapReady: {String(isMapReady)}
            </Text>

            <Text className="text-white font-mono text-xs mt-2 mb-1">
              Selected Location:
            </Text>
            <Text className="text-white font-mono text-xs">
              • lat: {selectedLocation.latitude.toFixed(6)}
            </Text>
            <Text className="text-white font-mono text-xs">
              • lng: {selectedLocation.longitude.toFixed(6)}
            </Text>

            <Text className="text-white font-mono text-xs mt-2 mb-1">
              Location Details:
            </Text>
            <Text className="text-white font-mono text-xs">
              • title: {locationDetail?.title || 'null'}
            </Text>
            <Text className="text-white font-mono text-xs">
              • address: {locationDetail?.address || 'null'}
            </Text>
            <Text className="text-white font-mono text-xs">
              • coordinates:{' '}
              {locationDetail?.coordinates
                ? `\n  lat: ${locationDetail.coordinates.latitude.toFixed(
                    6
                  )}\n  lng: ${locationDetail.coordinates.longitude.toFixed(6)}`
                : 'null'}
            </Text>

            <Text className="text-white font-mono text-xs mt-2 mb-1">
              Route Params:
            </Text>
            <Text className="text-white font-mono text-xs">• type: {type}</Text>
            <Text className="text-white font-mono text-xs">
              • initialLat: {initialLatitude}
            </Text>
            <Text className="text-white font-mono text-xs">
              • initialLng: {initialLongitude}
            </Text>
          </View>
        )}

        {/* Header */}
        <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 font-semibold text-lg">
            {type === 'pickup'
              ? 'Set Pickup Location'
              : 'Set Drop-off Location'}
          </Text>
          <View className="w-10" />
        </View>

        {/* Map Container */}
        <View className="flex-1 relative">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation
            showsMyLocationButton={false}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onMapReady={() => {
              setIsMapReady(true);
              setIsMapMoving(false);
              fetchLocationDetails();
            }}
            onRegionChangeComplete={(region) => {
              setIsLoading(true);
              setIsMapMoving(false);
              setSelectedLocation({
                latitude: region.latitude,
                longitude: region.longitude,
              });
            }}
            onRegionChange={() => {
              setIsMapMoving(true);
            }}
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
            onPress={handleMyLocation}
            className="absolute right-4 top-4 bg-white rounded-full w-12 h-12 items-center justify-center shadow-xl"
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="locate" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <View className="bg-white p-6 shadow-lg">
          <View className="min-h-[100px] justify-center mb-4">
            {!isMapReady ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-3 text-base">
                  Loading map...
                </Text>
              </View>
            ) : isLoading || isMapMoving ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-3 text-base">
                  Getting location...
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color={type === 'pickup' ? '#3B82F6' : '#EF4444'}
                  />
                  <Text className="text-gray-900 font-semibold text-xl flex-1">
                    {' ' + locationDetail?.title || 'Unknown Location'}
                  </Text>
                </View>
                <Text className="text-gray-600 text-base mb-2 pl-8">
                  {locationDetail?.address || 'Address not found'}
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={
              !isMapReady || isLoading || isMapMoving || !locationDetail
            }
            className={`py-5 px-6 rounded-2xl mt-2 mb-8 shadow-sm ${
              !isMapReady || isLoading || isMapMoving || !locationDetail
                ? 'bg-gray-300'
                : type === 'pickup'
                ? 'bg-blue-600 active:bg-blue-700'
                : 'bg-red-600 active:bg-red-700'
            }`}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {!isMapReady
                ? 'Loading Map...'
                : isLoading || isMapMoving
                ? 'Getting Location...'
                : type === 'pickup'
                ? 'Confirm Pickup Location'
                : 'Confirm Drop-off Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeView>
  );
}
