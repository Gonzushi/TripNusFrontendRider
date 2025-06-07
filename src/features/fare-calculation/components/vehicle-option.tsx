import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { type FareResponse, type Vehicle } from '../types';
import { formatPrice } from '../utils';

type VehicleOptionProps = {
  vehicle: Vehicle;
  isSelected: boolean;
  fares: FareResponse | null;
  onSelect: () => void;
};

export default function VehicleOption({
  vehicle,
  isSelected,
  fares,
  onSelect,
}: VehicleOptionProps) {
  const fare = fares?.[vehicle.id as keyof FareResponse];

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`mb-2 rounded-xl border px-3 py-2.5 ${
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`rounded-lg p-1.5 ${
            isSelected ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <MaterialCommunityIcons
            name={vehicle.icon}
            size={20}
            color={isSelected ? '#3B82F6' : '#4B5563'}
          />
        </View>
        <View className="ml-3 flex-1 flex-row items-center justify-between">
          <View>
            <Text className="font-medium text-gray-900">{vehicle.name}</Text>
          </View>
          <Text className="font-medium text-gray-900">
            Rp {fare ? formatPrice(fare.total_fare) : '-'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
