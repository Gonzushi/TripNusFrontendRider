import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { type FareResponse, type Vehicle } from '../types';
import { formatPrice } from '../utils';

type VehicleOptionProps = {
  vehicle: Vehicle;
  isSelected: boolean;
  fares: FareResponse | null;
  onSelect: () => void;
  disabled: boolean;
  etaMinutes?: number | null;
};

export default function VehicleOption({
  vehicle,
  isSelected,
  fares,
  onSelect,
  disabled,
  etaMinutes,
}: VehicleOptionProps) {
  const fare = fares?.[vehicle.id as keyof FareResponse];

  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={disabled}
      className={`mb-2 rounded-xl border px-3 py-2.5 ${
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Icon + Name + ETA */}
        <View className="flex-1 flex-row items-center">
          <View
            className={`rounded-lg p-1.5 ${
              isSelected ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <MaterialCommunityIcons
              name={vehicle.icon}
              size={20}
              color={disabled ? '#9CA3AF' : isSelected ? '#3B82F6' : '#4B5563'} // gray-400
            />
          </View>

          <View className="ml-3">
            <Text
              className={`font-medium ${
                disabled ? 'text-gray-400' : 'text-gray-900'
              }`}
            >
              {vehicle.name}
            </Text>
            {disabled ? (
              <Text className="mt-0.5 text-xs text-red-400">
                Tidak tersedia
              </Text>
            ) : (
              <Text className="text-xs text-gray-500">
                {etaMinutes} menit dari Anda
              </Text>
            )}
          </View>
        </View>

        {/* Right: Price (centered vertically) */}
        <View className="ml-2 items-end justify-center">
          <Text
            className={`font-medium ${
              disabled ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            Rp {fare ? formatPrice(fare.total_fare) : '-'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
