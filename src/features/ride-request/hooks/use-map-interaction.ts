import { useCallback, useRef, useState } from 'react';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';

import { type Coordinates } from '../types';

export function useMapInteraction(initialCoordinates: Coordinates) {
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialCoordinates);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
    setIsMapMoving(false);
  }, []);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setIsMapMoving(false);
    setSelectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  }, []);

  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
  }, []);

  const handleMyLocation = useCallback((coordinates: Coordinates) => {
    if (mapRef.current && coordinates) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, []);

  return {
    mapRef,
    selectedLocation,
    isMapMoving,
    isMapReady,
    handleMapReady,
    handleRegionChangeComplete,
    handleRegionChange,
    handleMyLocation,
  };
}
