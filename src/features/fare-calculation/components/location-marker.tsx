import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import { type Coordinates } from '../types';

type LocationMarkerProps = {
  type: 'pickup' | 'dropoff' | 'motorcycle' | 'car';
  coordinate: Coordinates;
};

export default function LocationMarker({
  type,
  coordinate,
}: LocationMarkerProps) {
  const getIconName = () => {
    if (type === 'motorcycle') return 'motorbike';
    if (type === 'car') return 'car';
    return 'map-marker';
  };

  const getColor = () => {
    if (type === 'pickup') return '#3B82F6'; // blue
    if (type === 'dropoff') return '#EF4444'; // red
    return '#EF4444'; // green for motorcycle & car
  };

  return (
    <Marker
      coordinate={coordinate}
      title={
        type === 'pickup'
          ? 'Pickup Location'
          : type === 'dropoff'
            ? 'Drop-off Location'
            : type.charAt(0).toUpperCase() + type.slice(1)
      }
    >
      <View className="items-center">
        <MaterialCommunityIcons
          name={getIconName()}
          size={30}
          color={getColor()}
        />
      </View>
    </Marker>
  );
}
