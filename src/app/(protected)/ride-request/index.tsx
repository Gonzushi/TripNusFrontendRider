// Core imports
import Env from '@env';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import LoadingDots from '@/components/loading-dots';
import LocationInput from '@/components/location-input';
import RouteMapPreview from '@/components/route-map-preview';
import { SafeView } from '@/lib/safe-view';
import { useLocationStore } from '@/store/use-location-store';
import type {
  LocationDetail,
  LocationSuggestion as LocationSuggestionType,
} from '@/types/location';
import { isLocationInIndonesia } from '@/utils/location-utils';

// Constants
const GOOGLE_API_KEY = Env.GOOGLE_API_KEY;
const LOCATION_SEARCH_RADIUS_M = 50000.0;
const SEARCH_DEBOUNCE_MS = 500;
const DEBUG_MODE = false;

// Debug utility
const debugLog = (message: string, data?: unknown) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[DEBUG] ${message}:`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
};

// Types
type InputMode = 'highlighted' | 'editing' | false;

type GooglePlaceLocation = {
  latitude: number;
  longitude: number;
};

type GooglePlace = {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  location?: GooglePlaceLocation;
};

export default function RideRequest() {
  const router = useRouter();
  const { selectedMapLocation, clearSelectedMapLocation } = useLocationStore();

  // Store current location details for reuse
  const currentLocationDetailsRef = useRef<LocationDetail | null>(null);

  // Input mode states
  const [pickupInputMode, setPickupInputMode] = useState<InputMode>(false);
  const [destinationInputMode, setDestinationInputMode] =
    useState<InputMode>(false);

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
  const [currentLocation, setCurrentLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

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
  const [suggestions, setSuggestions] = useState<LocationSuggestionType[]>([]);

  // Get location details from Google Places
  const fetchLocationDetails = async (
    placeId: string
  ): Promise<LocationDetail | null> => {
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      const response = await fetch(url, {
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const place = await response.json();

      if (place) {
        return {
          title: place.displayName.text,
          address: place.formattedAddress,
          place_id: place.id,
          coordinates: place.location
            ? {
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }
            : undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching location details:', error);
      return null;
    }
  };

  // Get current location on mount and store details
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          debugLog('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentLocation(coords);

        // Get location details using reverse geocoding
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
              `latlng=${coords.latitude},${coords.longitude}` +
              `&key=${GOOGLE_API_KEY}`
          );

          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const locationDetail = {
              title: 'Current Location',
              address: result.formatted_address,
              place_id: result.place_id,
              coordinates: coords,
            };
            // Store the location details for reuse
            currentLocationDetailsRef.current = locationDetail;
            setPickupLocation(locationDetail);
            setPreviousPickupLocation(locationDetail);
          } else {
            // Fallback if no results found
            const locationDetail = {
              title: 'Current Location',
              address: `${coords.latitude.toFixed(
                6
              )}, ${coords.longitude.toFixed(6)}`,
              coordinates: coords,
            };
            // Store the location details for reuse
            currentLocationDetailsRef.current = locationDetail;
            setPickupLocation(locationDetail);
            setPreviousPickupLocation(locationDetail);
          }
        } catch (error) {
          debugLog('Error fetching reverse geocoding:', error);
          // Fallback on error
          const locationDetail = {
            title: 'Current Location',
            address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(
              6
            )}`,
            coordinates: coords,
          };
          // Store the location details for reuse
          currentLocationDetailsRef.current = locationDetail;
          setPickupLocation(locationDetail);
          setPreviousPickupLocation(locationDetail);
        }
      } catch (error) {
        debugLog('Error getting location:', error);
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
  const searchLocations = useCallback(
    async (searchText: string) => {
      debugLog('Searching for:', searchText);
      debugLog('Current location:', currentLocation);

      if (!searchText || searchText.length < 3 || !currentLocation) {
        debugLog('Search cancelled', {
          noText: !searchText,
          tooShort: searchText?.length < 3,
          noLocation: !currentLocation,
        });
        return;
      }

      try {
        setIsLoading(true);
        const url = `https://places.googleapis.com/v1/places:searchText`;

        debugLog('Fetching suggestions from:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask':
              'places.displayName,places.formattedAddress,places.id,places.location',
          },
          body: JSON.stringify({
            textQuery: searchText,
            locationBias: {
              circle: {
                center: {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                },
                radius: LOCATION_SEARCH_RADIUS_M,
              },
            },
            languageCode: 'en',
            regionCode: 'ID',
          }),
        });

        if (!response.ok) {
          debugLog('Places API error response:', await response.json());
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        debugLog('Places API response:', data);

        if (data.places) {
          // Transform Places API suggestions to our format
          const apiSuggestions: LocationSuggestionType[] = data.places.map(
            (place: GooglePlace) => ({
              title: place.displayName.text,
              address: place.formattedAddress,
              type: 'api',
              place_id: place.id,
              coordinates: place.location
                ? {
                    latitude: place.location.latitude,
                    longitude: place.location.longitude,
                  }
                : undefined,
            })
          );

          debugLog('Transformed suggestions:', apiSuggestions);
          setSuggestions(apiSuggestions);
        } else {
          debugLog('No places in response');
          setSuggestions([]);
        }
      } catch (error) {
        debugLog('Error fetching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLocation, sessionToken]
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
    debugLog('Input changed', {
      pickupTitle: pickupLocation.title,
      destinationTitle: destinationLocation.title,
      pickupMode: pickupInputMode,
      destinationMode: destinationInputMode,
    });

    if (pickupInputMode !== 'editing' && destinationInputMode !== 'editing') {
      debugLog('Not in editing mode, skipping search');
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      if (pickupInputMode === 'editing') {
        debugLog('Searching for pickup location:', pickupLocation.title);
        searchLocations(pickupLocation.title);
      } else if (destinationInputMode === 'editing') {
        debugLog(
          'Searching for destination location:',
          destinationLocation.title
        );
        searchLocations(destinationLocation.title);
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
    searchLocations,
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);

      // Create a basic location detail
      const locationDetail = {
        title: 'Current Location',
        address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(
          6
        )}`,
        coordinates: coords,
      };

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
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [pickupInputMode, destinationInputMode]);

  // Handle suggestion selection
  const handleSuggestionSelect = async (location: LocationSuggestionType) => {
    let locationDetail: LocationDetail = {
      title: location.title,
      address: location.address,
    };

    if (location.place_id) {
      const details = await fetchLocationDetails(location.place_id);
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

  const renderDebugInfo = () => (
    <View className="mx-4 mb-8 mt-4 rounded-lg bg-black/90 p-4">
      <Text className="mb-4 font-mono text-base font-bold text-white">
        Debug Info
      </Text>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Input States
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • pickupInputMode: {String(pickupInputMode)}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • destinationInputMode: {String(destinationInputMode)}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Loading States
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • isLoadingLocation: {String(isLoadingLocation)}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • isTyping: {String(isTyping)}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • isLoading: {String(isLoading)}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Current Location
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • coordinates:{' '}
          {currentLocation
            ? `${currentLocation.latitude.toFixed(
                6
              )}, ${currentLocation.longitude.toFixed(6)}`
            : 'null'}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Pickup Location
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • title: {pickupLocation.title || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • address: {pickupLocation.address || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • place_id: {pickupLocation.place_id || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • coordinates:{' '}
          {pickupLocation.coordinates
            ? `${pickupLocation.coordinates.latitude.toFixed(
                6
              )}, ${pickupLocation.coordinates.longitude.toFixed(6)}`
            : 'null'}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Previous Pickup Location
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • title: {previousPickupLocation.title || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • address: {previousPickupLocation.address || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • place_id: {previousPickupLocation.place_id || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • coordinates:{' '}
          {previousPickupLocation.coordinates
            ? `${previousPickupLocation.coordinates.latitude.toFixed(
                6
              )}, ${previousPickupLocation.coordinates.longitude.toFixed(6)}`
            : 'null'}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Destination Location
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • title: {destinationLocation.title || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • address: {destinationLocation.address || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • place_id: {destinationLocation.place_id || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • coordinates:{' '}
          {destinationLocation.coordinates
            ? `${destinationLocation.coordinates.latitude.toFixed(
                6
              )}, ${destinationLocation.coordinates.longitude.toFixed(6)}`
            : 'null'}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Previous Destination Location
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • title: {previousDestinationLocation.title || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • address: {previousDestinationLocation.address || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • place_id: {previousDestinationLocation.place_id || 'null'}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • coordinates:{' '}
          {previousDestinationLocation.coordinates
            ? `${previousDestinationLocation.coordinates.latitude.toFixed(
                6
              )}, ${previousDestinationLocation.coordinates.longitude.toFixed(
                6
              )}`
            : 'null'}
        </Text>
      </View>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Search
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • sessionToken: {sessionToken}
        </Text>
        <Text className="font-mono text-xs text-white/80">
          • suggestions count: {suggestions.length}
        </Text>
      </View>

      <View>
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Selected Map Location
        </Text>
        {selectedMapLocation ? (
          <Fragment>
            <Text className="font-mono text-xs text-white/80">
              • type: {selectedMapLocation.type}
            </Text>
            <Text className="font-mono text-xs text-white/80">
              • title: {selectedMapLocation.location.title || 'null'}
            </Text>
            <Text className="font-mono text-xs text-white/80">
              • address: {selectedMapLocation.location.address || 'null'}
            </Text>
            <Text className="font-mono text-xs text-white/80">
              • place_id: {selectedMapLocation.location.place_id || 'null'}
            </Text>
            <Text className="font-mono text-xs text-white/80">
              • coordinates:{' '}
              {selectedMapLocation.location.coordinates
                ? `${selectedMapLocation.location.coordinates.latitude.toFixed(
                    6
                  )}, ${selectedMapLocation.location.coordinates.longitude.toFixed(
                    6
                  )}`
                : 'null'}
            </Text>
          </Fragment>
        ) : (
          <Text className="font-mono text-xs text-white/80">• null</Text>
        )}
      </View>
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
                {DEBUG_MODE && renderDebugInfo()}
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
