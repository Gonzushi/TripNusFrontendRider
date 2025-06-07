import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import { type Coordinates } from '../types';

type LocationMarkerProps = {
  type: 'pickup' | 'dropoff';
  coordinate: Coordinates;
};

export default function LocationMarker({
  type,
  coordinate,
}: LocationMarkerProps) {
  return (
    <Marker
      coordinate={coordinate}
      title={`${type === 'pickup' ? 'Pickup' : 'Drop-off'} Location`}
    >
      <View className="items-center">
        <MaterialCommunityIcons
          name="map-marker"
          size={40}
          color={type === 'pickup' ? '#3B82F6' : '#EF4444'}
        />
      </View>
    </Marker>
  );
}
