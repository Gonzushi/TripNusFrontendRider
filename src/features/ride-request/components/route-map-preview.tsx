import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import type { LocationDetail } from '@/features/ride-request/types';

type RouteMapPreviewProps = {
  pickupLocation: LocationDetail;
  destinationLocation: LocationDetail;
};

export default function RouteMapPreview({
  pickupLocation,
  destinationLocation,
}: RouteMapPreviewProps) {
  const mapRef = useRef<MapView>(null);
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  // Ensure both locations have coordinates
  if (!pickupLocation.coordinates || !destinationLocation.coordinates) {
    return null;
  }

  const pickupCoords = {
    latitude: pickupLocation.coordinates.latitude,
    longitude: pickupLocation.coordinates.longitude,
  };

  const destinationCoords = {
    latitude: destinationLocation.coordinates.latitude,
    longitude: destinationLocation.coordinates.longitude,
  };

  // Calculate the center point between pickup and destination
  const centerLat = (pickupCoords.latitude + destinationCoords.latitude) / 2;
  const centerLng = (pickupCoords.longitude + destinationCoords.longitude) / 2;

  // Fit map to show both markers
  useEffect(() => {
    if (mapRef.current) {
      // Add a slight delay to ensure the map is ready
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([pickupCoords, destinationCoords], {
          edgePadding: {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100,
          },
          animated: true,
        });
      }, 500);
    }
  }, [pickupCoords, destinationCoords]);

  return (
    <View className="flex-1 overflow-hidden border border-gray-200">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled={true}
      >
        {/* Pickup Location Marker */}
        <Marker
          coordinate={pickupCoords}
          title="Titik Jemput"
          description={pickupLocation.address}
        >
          <MaterialCommunityIcons name="map-marker" size={40} color="#3B82F6" />
        </Marker>

        {/* Destination Location Marker */}
        <Marker
          coordinate={destinationCoords}
          title="Tujuan"
          description={destinationLocation.address}
        >
          <MaterialCommunityIcons name="map-marker" size={40} color="#EF4444" />
        </Marker>
      </MapView>
    </View>
  );
}
