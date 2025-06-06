// Core imports
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Local imports
import {
  fetchLocationDetail,
  getCurrentLocation,
  reverseGeocode,
  searchLocations,
} from '@/features/ride-request/api';
import {
  LoadingDots,
  LocationInput,
  RouteMapPreview,
} from '@/features/ride-request/components';
import renderDebugInfo from '@/features/ride-request/components/debug-info';
import { SEARCH_DEBOUNCE_MS } from '@/features/ride-request/constants';
import type {
  Coordinates,
  LocationDetail,
  SearchBoxInputMode,
} from '@/features/ride-request/types';
import { isLocationInIndonesia } from '@/features/ride-request/utils';
import { useLocationStore } from '@/lib/hooks/use-location-store';
import { SafeView } from '@/lib/safe-view';

const DEBUG_MODE = false;

export default function RideRequest() {
  const router = useRouter();
  const { selectedMapLocation, clearSelectedMapLocation } = useLocationStore();

  // Store current location details for reuse
  const currentLocationDetailsRef = useRef<LocationDetail | null>(null);

  // Input mode states
  const [pickupInputMode, setPickupInputMode] =
    useState<SearchBoxInputMode>(false);
  const [destinationInputMode, setDestinationInputMode] =
    useState<SearchBoxInputMode>(false);

  // Location states
  const [pickupLocation, setPickupLocation] = useState<LocationDetail>({
    title: 'Current Location',
    address: 'Getting your location...',
  });

  const [previousPickupLocation, setPreviousPickupLocation] =
    useState<LocationDetail>(pickupLocation);
  const [destinationLocation, setDestinationLocation] =
    useState<LocationDetail>({
      title: '',
      address: '',
    });
  const [previousDestinationLocation, setPreviousDestinationLocation] =
    useState<LocationDetail>({
      title: '',
      address: '',
    });
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null
  );

  // Loading states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search states
  const [sessionToken] = useState(
    () =>
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  );
  const [suggestions, setSuggestions] = useState<LocationDetail[]>([]);

  // Get current location on mount and store details
  useEffect(() => {
    (async () => {
      try {
        const coords = await getCurrentLocation();
        if (!coords) return;

        setCurrentLocation(coords);
        const locationDetail = await reverseGeocode(coords);

        if (locationDetail) {
          currentLocationDetailsRef.current = locationDetail;
          setPickupLocation(locationDetail);
          setPreviousPickupLocation(locationDetail);
        }
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

  // Render Components
  const renderNavigationHeader = () => (
    <View className="flex-row items-center justify-between bg-white px-4 py-3">
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-black">Request a Ride</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const renderHeader = () => (
    <View
      className={`bg-white ${
        !pickupInputMode && !destinationInputMode
          ? 'border-b border-gray-200'
          : ''
      }`}
    >
      <View className="p-3">
        {/* Search Card */}
        <View className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <View className="flex-row items-start">
            <View className="">
              <View className="items-center space-y-1 py-4">
                <View className="h-3 w-3 self-center rounded-full bg-blue-600" />
                <View className="h-14 w-0.5 bg-gray-300" />
                <View className="h-3 w-3 self-center rounded-full bg-red-600" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <View className="flex-row items-start">
                <View className="flex-1">
                  <LocationInput
                    label=""
                    value={
                      isLoadingLocation
                        ? 'Getting your location...'
                        : pickupLocation.title
                    }
                    placeholder="Enter pickup point"
                    isEditing={pickupInputMode === 'editing'}
                    isHighlighted={pickupInputMode === 'highlighted'}
                    onPress={handlePickupPress}
                    onChangeText={(text) =>
                      setPickupLocation((prev) => ({ ...prev, title: text }))
                    }
                    onClear={() =>
                      setPickupLocation((prev) => ({ ...prev, title: '' }))
                    }
                    isLoading={isLoadingLocation}
                    customInputStyle={`bg-white rounded-xl py-3 px-4 border-2 ${
                      pickupInputMode === 'editing'
                        ? 'border-blue-600'
                        : pickupInputMode === 'highlighted'
                          ? 'border-blue-600'
                          : 'border-gray-200/50'
                    }`}
                  />
                </View>
                {pickupInputMode === 'highlighted' && (
                  <TouchableOpacity
                    onPress={() => handleMapPress('pickup')}
                    className="ml-2 self-center rounded-xl border border-blue-600 bg-blue-100 p-2 active:bg-blue-100"
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={24}
                      color="#2563EB"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View className="h-3" />

              <View className="flex-row items-start">
                <View className="flex-1">
                  <LocationInput
                    label=""
                    value={destinationLocation.title}
                    placeholder="Enter drop-off point"
                    isEditing={destinationInputMode === 'editing'}
                    isHighlighted={destinationInputMode === 'highlighted'}
                    onPress={handleDestinationPress}
                    onChangeText={(text) =>
                      setDestinationLocation((prev) => ({
                        ...prev,
                        title: text,
                      }))
                    }
                    onClear={() =>
                      setDestinationLocation((prev) => ({ ...prev, title: '' }))
                    }
                    customInputStyle={`bg-white rounded-xl py-3 px-4 border-2 ${
                      destinationInputMode === 'editing'
                        ? 'border-red-600'
                        : destinationInputMode === 'highlighted'
                          ? 'border-red-600'
                          : 'border-gray-200/50'
                    }`}
                  />
                </View>
                {destinationInputMode === 'highlighted' && (
                  <TouchableOpacity
                    onPress={() => handleMapPress('destination')}
                    className="ml-2 self-center rounded-xl border border-red-600 bg-red-100 p-2 active:bg-red-600"
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={24}
                      color="#dc2626"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurrentLocationButton = () => (
    <TouchableOpacity
      onPress={handleUseCurrentLocation}
      disabled={isLoadingLocation}
      className="flex-row items-center bg-white px-4 py-3 active:bg-gray-50"
    >
      <View className="rounded-full bg-blue-50 p-2">
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={24}
          color="#3B82F6"
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-medium text-gray-900">Use current location</Text>
        <Text className="text-sm text-gray-500">
          {isLoadingLocation
            ? 'Getting your location...'
            : 'Quick select your current position'}
        </Text>
      </View>
      {isLoadingLocation && <ActivityIndicator size="small" color="#3B82F6" />}
    </TouchableOpacity>
  );

  const renderSuggestions = () => (
    <View className="mt-2 bg-white">
      <View className="border-b border-gray-100 px-4 py-3">
        <Text className="text-sm font-medium text-gray-900">
          {isTyping || isLoading ? 'Searching...' : 'Suggestions'}
        </Text>
      </View>

      {isTyping || isLoading ? (
        <View className="flex items-center justify-center py-8">
          <LoadingDots size={8} spacing={4} color="#3B82F6" />
        </View>
      ) : suggestions.length > 0 ? (
        suggestions.map((location, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSuggestionSelect(location)}
            className="px-4 py-3 active:bg-gray-50"
          >
            <View className="flex-row items-center">
              <View className="rounded-full bg-gray-100 p-2">
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#4B5563"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-medium text-gray-900" numberOfLines={1}>
                  {location.title}
                </Text>
                <Text className="text-sm text-gray-500" numberOfLines={2}>
                  {location.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View className="items-center px-4 py-12">
          <MaterialCommunityIcons name="map-search" size={48} color="#9CA3AF" />
          <Text className="mt-4 text-center text-gray-400">
            Type to search for locations
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <MaterialCommunityIcons
        name="map-marker-path"
        size={120}
        color="#3B82F6"
      />
      <Text className="mt-6 text-center text-xl font-semibold text-gray-900">
        Where would you like to go?
      </Text>
      <Text className="mt-2 text-center leading-5 text-gray-500">
        Enter your pickup and destination locations above to get started with
        your journey
      </Text>
    </View>
  );

  // Main Render
  return (
    <SafeView>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View className="flex-1 bg-gray-100">
          {renderNavigationHeader()}
          {renderHeader()}

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
                  {renderCurrentLocationButton()}
                  {renderSuggestions()}
                </View>
                {DEBUG_MODE &&
                  renderDebugInfo({
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
              </ScrollView>
            ) : (
              renderEmptyState()
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
        </View>
      </TouchableWithoutFeedback>
    </SafeView>
  );
}
