import { Fragment } from 'react';
import { Text, View } from 'react-native';

import type {
  Coordinates,
  LocationDetail,
  SearchBoxInputMode,
} from '@/features/ride-request/types';
import { type SelectedMapLocation } from '@/lib/hooks/use-location-store';

type DebugInfoProps = {
  pickupInputMode: SearchBoxInputMode;
  pickupLocation: LocationDetail;
  previousPickupLocation: LocationDetail;
  destinationInputMode: SearchBoxInputMode;
  destinationLocation: LocationDetail;
  previousDestinationLocation: LocationDetail;
  isLoadingLocation: boolean;
  isTyping: boolean;
  isLoading: boolean;
  currentLocation: Coordinates | null;
  sessionToken: string;
  suggestions: LocationDetail[];
  selectedMapLocation: SelectedMapLocation | null;
};

export default function RenderDebugInfo({
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
}: DebugInfoProps) {
  return (
    <View className="mx-4 mb-8 mt-4 rounded-lg bg-black/40 p-4">
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
              )}, ${previousDestinationLocation.coordinates.longitude.toFixed(6)}`
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
}
