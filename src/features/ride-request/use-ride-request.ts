import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';

import {
  type LocationStore,
  useLocationStore,
} from '@/lib/hooks/use-location-store';

import {
  type Coordinates,
  type LocationDetail,
  type SearchBoxInputMode,
} from './types';

// Constants for initial location states
const INITIAL_STATES = {
  empty: {
    title: '',
    address: '',
  } as const satisfies LocationDetail,

  currentLocation: {
    title: 'Current Location',
    address: 'Getting your location...',
  } as const satisfies LocationDetail,
} as const;

type RideRequestState = {
  // Navigation
  router: ReturnType<typeof useRouter>;

  // Location Store
  selectedMapLocation: LocationStore['selectedMapLocation'];
  clearSelectedMapLocation: LocationStore['clearSelectedMapLocation'];

  // Refs
  currentLocationDetailsRef: React.RefObject<LocationDetail | null>;

  // Input Modes
  pickupInputMode: SearchBoxInputMode;
  destinationInputMode: SearchBoxInputMode;

  // Locations
  pickupLocation: LocationDetail;
  previousPickupLocation: LocationDetail;
  destinationLocation: LocationDetail;
  previousDestinationLocation: LocationDetail;
  currentLocation: Coordinates | null;

  // Loading States
  isLoadingLocation: boolean;
  isTyping: boolean;
  isLoading: boolean;

  // Search
  sessionToken: string;
  suggestions: LocationDetail[];

  // Setters
  setPickupInputMode: (mode: SearchBoxInputMode) => void;
  setDestinationInputMode: (mode: SearchBoxInputMode) => void;
  setPickupLocation: (
    location: LocationDetail | ((prev: LocationDetail) => LocationDetail)
  ) => void;
  setPreviousPickupLocation: (location: LocationDetail) => void;
  setDestinationLocation: (
    location: LocationDetail | ((prev: LocationDetail) => LocationDetail)
  ) => void;
  setPreviousDestinationLocation: (location: LocationDetail) => void;
  setCurrentLocation: (location: Coordinates | null) => void;
  setIsLoadingLocation: (isLoading: boolean) => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSuggestions: (suggestions: LocationDetail[]) => void;
};

export function useRideRequest(): RideRequestState {
  const router = useRouter();
  const { selectedMapLocation, clearSelectedMapLocation } = useLocationStore();

  // Refs
  const currentLocationDetailsRef = useRef<LocationDetail | null>(null);

  // Input mode states
  const [pickupInputMode, setPickupInputMode] =
    useState<SearchBoxInputMode>(false);
  const [destinationInputMode, setDestinationInputMode] =
    useState<SearchBoxInputMode>(false);

  // Location states
  const [pickupLocation, setPickupLocation] = useState<LocationDetail>(
    INITIAL_STATES.currentLocation
  );
  const [previousPickupLocation, setPreviousPickupLocation] =
    useState<LocationDetail>(INITIAL_STATES.currentLocation);
  const [destinationLocation, setDestinationLocation] =
    useState<LocationDetail>(INITIAL_STATES.empty);
  const [previousDestinationLocation, setPreviousDestinationLocation] =
    useState<LocationDetail>(INITIAL_STATES.empty);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null
  );

  // Loading states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search states
  const sessionToken = useMemo(
    () =>
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
    []
  );
  const [suggestions, setSuggestions] = useState<LocationDetail[]>([]);

  return {
    // Navigation
    router,

    // Location Store
    selectedMapLocation,
    clearSelectedMapLocation,

    // Refs
    currentLocationDetailsRef,

    // Input Modes
    pickupInputMode,
    destinationInputMode,

    // Locations
    pickupLocation,
    previousPickupLocation,
    destinationLocation,
    previousDestinationLocation,
    currentLocation,

    // Loading States
    isLoadingLocation,
    isTyping,
    isLoading,

    // Search
    sessionToken,
    suggestions,

    // Setters
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
  };
}
