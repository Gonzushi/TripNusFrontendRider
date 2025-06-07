import React from 'react';
import { Text, View } from 'react-native';

import {
  type Coordinates,
  type LocationDetail,
} from '@/features/ride-request/types';

type DebugVariables = {
  type: unknown;
  initialCoordinates: Coordinates;
  selectedLocation: Coordinates;
  isMapMoving: boolean;
  isMapReady: boolean;
  isLoading: boolean;
  locationDetail: LocationDetail | null;
};

export default function DebugOverlay({
  variables,
}: {
  variables: DebugVariables;
}) {
  return (
    <View
      className="absolute left-0 right-0 top-0 z-50 bg-black/30 p-4"
      pointerEvents="none"
      style={{ maxHeight: '50%' }}
    >
      <Text className="text-xs font-bold text-white">DEBUG INFO:</Text>
      {Object.entries(variables).map(([key, value]) => (
        <Text key={key} className="text-xs text-white">
          {key}: {JSON.stringify(value, null, 2)}
        </Text>
      ))}
    </View>
  );
}
