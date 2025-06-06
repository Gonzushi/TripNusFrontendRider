// Core imports
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  fetchLocationDetail,
  getCurrentLocation,
  reverseGeocode,
  searchLocations,
} from '@/features/ride-request/api';
import {
  RenderCurrentLocationButton,
  RenderDebugInfo,
  RenderEmptyState,
  RenderHeader,
  RenderNavigationHeader,
  RenderSuggestions,
  RouteMapPreview,
} from '@/features/ride-request/components';
import { SEARCH_DEBOUNCE_MS } from '@/features/ride-request/constants';
import type { LocationDetail } from '@/features/ride-request/types';
import { useRideRequest } from '@/features/ride-request/use-ride-request';
import { isLocationInIndonesia } from '@/features/ride-request/utils';
import { SafeView } from '@/lib/safe-view';

const DEBUG_MODE = true;

export default function RideRequest() {
  const {
    router,
    selectedMapLocation,
    clearSelectedMapLocation,
    currentLocationDetailsRef,
    pickupInputMode,
    destinationInputMode,
    pickupLocation,
    previousPickupLocation,
    destinationLocation,
    previousDestinationLocation,
    currentLocation,
    isLoadingLocation,
    isTyping,
    isLoading,
    sessionToken,
    suggestions,
    setPickupInputMode,
    setDestinationInputMode,
    setPickupLocation,
    setPreviousPickupLocation,
    setDestinationLocation,
    setPreviousDestinationLocation,
    setCurrentLocation,
    setIsLoadingLocation,
    setIsTyping,
    setIsLoading,
    setSuggestions,
  } = useRideRequest();

  // Get current location on mount and store details
  useEffect(() => {
    (async () => {
      try {
        const coords = await getCurrentLocation();
        if (!coords) return;

        setCurrentLocation(coords);
        // const locationDetail = await reverseGeocode(coords);

        // if (locationDetail) {
        //   currentLocationDetailsRef.current = locationDetail;
        //   setPickupLocation(locationDetail);
        //   setPreviousPickupLocation(locationDetail);
        // }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Handle clicking outside the input boxes
  const handleOutsidePress = () => {
    if (pickupInputMode === 'editing') {
      setPickupLocation(previousPickupLocation);
    }
    if (destinationInputMode === 'editing') {
      setDestinationLocation(previousDestinationLocation);
    }
    setPickupInputMode(false);
    setDestinationInputMode(false);
    Keyboard.dismiss();
  };

  // Debounced search function
  const searchLocationsCallback = useCallback(
    async (searchText: string) => {
      if (!searchText || searchText.length < 4 || !currentLocation) {
        return;
      }

      try {
        setIsLoading(true);
        const places = await searchLocations(searchText, currentLocation);

        const apiSuggestions = places.map((place) => ({
          title: place.displayName.text,
          address: place.formattedAddress,
          type: 'api' as const,
          place_id: place.id,
          coordinates: place.location
            ? {
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }
            : undefined,
        }));
        setSuggestions(apiSuggestions);
      } catch (error) {
        console.log('Error fetching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLocation]
  );

  // Input handlers
  const handlePickupPress = () => {
    if (!pickupInputMode) {
      setDestinationLocation(previousDestinationLocation);
      setPickupInputMode('highlighted');
      setDestinationInputMode(false);
      setPreviousPickupLocation(pickupLocation);
    } else if (pickupInputMode === 'highlighted') {
      setPickupInputMode('editing');
      setPickupLocation((prev) => ({ ...prev, title: '' }));
      setSuggestions([]);
    }
  };

  const handleDestinationPress = () => {
    if (!destinationInputMode) {
      setPickupLocation(previousPickupLocation);
      setDestinationInputMode('highlighted');
      setPickupInputMode(false);
      setPreviousDestinationLocation(destinationLocation);
    } else if (destinationInputMode === 'highlighted') {
      setDestinationInputMode('editing');
      setDestinationLocation((prev) => ({ ...prev, title: '' }));
      setSuggestions([]);
    }
  };

  // Debounce setup with 500ms
  useEffect(() => {
    if (pickupInputMode !== 'editing' && destinationInputMode !== 'editing') {
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      if (pickupInputMode === 'editing') {
        console.log('Searching for pickup location:', pickupLocation.title);
        searchLocationsCallback(pickupLocation.title);
      } else if (destinationInputMode === 'editing') {
        console.log(
          'Searching for destination location:',
          destinationLocation.title
        );
        searchLocationsCallback(destinationLocation.title);
      }
      setIsTyping(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      setIsTyping(false);
    };
  }, [
    pickupLocation.title,
    destinationLocation.title,
    pickupInputMode,
    destinationInputMode,
    searchLocationsCallback,
  ]);

  // Handle using current location button - now uses stored details
  const handleUseCurrentLocation = useCallback(async () => {
    // If we have stored current location details, use them immediately
    if (currentLocationDetailsRef.current) {
      if (pickupInputMode === 'editing') {
        setPickupLocation(currentLocationDetailsRef.current);
        setPreviousPickupLocation(currentLocationDetailsRef.current);
        setPickupInputMode(false);
      } else if (destinationInputMode === 'editing') {
        setDestinationLocation(currentLocationDetailsRef.current);
        setPreviousDestinationLocation(currentLocationDetailsRef.current);
        setDestinationInputMode(false);
      }
      return;
    }

    // Fallback to fetching current location if somehow we don't have stored details
    try {
      setIsLoadingLocation(true);
      const coords = await getCurrentLocation();
      if (!coords) return;

      setCurrentLocation(coords);
      const locationDetail = await reverseGeocode(coords);

      if (locationDetail) {
        // Store for future use
        currentLocationDetailsRef.current = locationDetail;

        if (pickupInputMode === 'editing') {
          setPickupLocation(locationDetail);
          setPreviousPickupLocation(locationDetail);
          setPickupInputMode(false);
        } else if (destinationInputMode === 'editing') {
          setDestinationLocation(locationDetail);
          setPreviousDestinationLocation(locationDetail);
          setDestinationInputMode(false);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [pickupInputMode, destinationInputMode]);

  // Handle suggestion selection
  const handleSuggestionSelect = async (location: LocationDetail) => {
    let locationDetail: LocationDetail = {
      title: location.title,
      address: location.address,
    };

    if (location.place_id) {
      const details = await fetchLocationDetail(location.place_id);
      if (details) {
        locationDetail = details;
      }
    }

    if (destinationInputMode) {
      setDestinationLocation(locationDetail);
      setPreviousDestinationLocation(locationDetail);
      setDestinationInputMode(false);
    } else if (pickupInputMode) {
      setPickupLocation(locationDetail);
      setPreviousPickupLocation(locationDetail);
      setPickupInputMode(false);
    }
  };

  // Handle map button press
  const handleMapPress = (locationType: 'pickup' | 'destination') => {
    const initialCoords =
      locationType === 'pickup'
        ? pickupLocation.coordinates || currentLocation
        : destinationLocation.coordinates || currentLocation;

    if (!initialCoords) return;

    router.push({
      pathname: '/ride-request/map-picker',
      params: {
        type: locationType,
        initialLatitude: initialCoords.latitude,
        initialLongitude: initialCoords.longitude,
      },
    });
  };

  // Handle location selection from map
  useEffect(() => {
    if (selectedMapLocation) {
      const { location, type } = selectedMapLocation;

      if (type === 'pickup') {
        setPickupLocation(location);
        setPreviousPickupLocation(location);
        setPickupInputMode(false);
      } else if (type === 'destination') {
        setDestinationLocation(location);
        setPreviousDestinationLocation(location);
        setDestinationInputMode(false);
      }

      // Clear the store data after using it
      clearSelectedMapLocation();
    }
  }, [selectedMapLocation, clearSelectedMapLocation]);

  // Function to handle ride confirmation
  const handleConfirmRide = () => {
    if (pickupLocation.coordinates && destinationLocation.coordinates) {
      // Check if both locations are in Indonesia
      const isPickupInIndonesia = isLocationInIndonesia(
        pickupLocation.coordinates
      );
      const isDestinationInIndonesia = isLocationInIndonesia(
        destinationLocation.coordinates
      );

      if (!isPickupInIndonesia || !isDestinationInIndonesia) {
        Alert.alert(
          'Location Error',
          'Both pickup and destination locations must be within Indonesia.',
          [{ text: 'OK' }]
        );
        return;
      }

      router.push({
        pathname: '/ride-request/fare-calculation',
        params: {
          pickupLat: pickupLocation.coordinates.latitude,
          pickupLng: pickupLocation.coordinates.longitude,
          pickupAddress: pickupLocation.address,
          dropoffLat: destinationLocation.coordinates.latitude,
          dropoffLng: destinationLocation.coordinates.longitude,
          dropoffAddress: destinationLocation.address,
        },
      });
    }
  };

  // Main Render
  return (
    <SafeView>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View className="flex-1 bg-gray-100">
          {RenderNavigationHeader({ router })}
          {RenderHeader({
            pickupInputMode,
            destinationInputMode,
            pickupLocation,
            destinationLocation,
            isLoadingLocation,
            handlePickupPress,
            handleDestinationPress,
            handleMapPress,
            setPickupLocation,
            setDestinationLocation,
          })}

          {/* Main Content Area */}
          <View className="flex-1">
            {pickupLocation.coordinates &&
            destinationLocation.coordinates &&
            !pickupInputMode &&
            !destinationInputMode ? (
              <View className="flex-1">
                <RouteMapPreview
                  pickupLocation={pickupLocation}
                  destinationLocation={destinationLocation}
                />
              </View>
            ) : pickupInputMode === 'editing' ||
              destinationInputMode === 'editing' ? (
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                <View className="border-t border-gray-200 bg-white">
                  {RenderCurrentLocationButton({
                    handleUseCurrentLocation,
                    isLoadingLocation,
                  })}
                  {RenderSuggestions({
                    isTyping,
                    isLoading,
                    suggestions,
                    handleSuggestionSelect,
                  })}
                </View>
              </ScrollView>
            ) : (
              RenderEmptyState()
            )}
          </View>

          {/* Bottom Fixed Section */}
          {!pickupInputMode && !destinationInputMode && (
            <View className="border-t border-gray-200 bg-white px-6 pb-8 pt-4">
              {/* Tip Section */}
              <View className="mb-4 mt-2 flex-row items-center">
                <Ionicons name="bulb" size={20} color="#3B82F6" />
                <Text className="ml-2 text-sm text-blue-600">
                  Tip: Make sure your pickup point is accurate for faster
                  pickup!
                </Text>
              </View>

              {/* Get Fare Estimate Button */}
              <TouchableOpacity
                onPress={handleConfirmRide}
                disabled={
                  !pickupLocation.coordinates ||
                  !destinationLocation.coordinates
                }
                className={`mb-4 mt-2 flex-row items-center justify-center rounded-xl py-4 ${
                  pickupLocation.coordinates && destinationLocation.coordinates
                    ? 'bg-blue-600 active:bg-blue-700'
                    : 'bg-gray-300'
                }`}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color="white"
                  className="mr-2"
                />
                <Text className="ml-2 font-semibold text-white">
                  Get Fare Estimate
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity onPress={() => router.back()}>
                <View className="mb-4 rounded-xl border border-gray-200 py-4">
                  <Text className="text-center font-medium text-gray-600">
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Debug Info Overlay */}
          <View className="pointer-events-none absolute left-20 top-0 z-50 max-h-[50%]">
            {DEBUG_MODE &&
              RenderDebugInfo({
                pickupInputMode,
                pickupLocation,
                previousPickupLocation,
                destinationInputMode,
                destinationLocation,
                previousDestinationLocation,
                isLoadingLocation,
                isTyping,
                isLoading,
                currentLocation,
                sessionToken,
                suggestions,
                selectedMapLocation,
              })}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeView>
  );
}
