import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { type LocationDetail } from '@/features/ride-request/types';

type BottomSheetProps = {
  isMapReady: boolean;
  isLoading: boolean;
  isMapMoving: boolean;
  locationDetail: LocationDetail | null;
  type: string;
  onConfirm: () => void;
};

export function LocationBottomSheet({
  isMapReady,
  isLoading,
  isMapMoving,
  locationDetail,
  type,
  onConfirm,
}: BottomSheetProps) {
  const renderLoadingState = (message: string) => (
    <View className="items-center py-3">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-2 text-sm text-gray-500">{message}</Text>
    </View>
  );

  const renderLocationDetails = () => (
    <View>
      <View className="mb-1 flex-row items-center">
        <MaterialCommunityIcons
          name="map-marker"
          size={20}
          color={type === 'pickup' ? '#3B82F6' : '#EF4444'}
        />
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          {' ' + locationDetail?.title || 'Lokasi Tidak Diketahui'}
        </Text>
      </View>
      <Text className="mb-2 pl-7 text-sm text-gray-600">
        {locationDetail?.address || 'Alamat tidak ditemukan'}
      </Text>
    </View>
  );

  const getConfirmButtonText = () => {
    if (!isMapReady) return 'Memuat Peta...';
    if (isLoading || isMapMoving) return 'Mendapatkan Lokasi...';
    return type === 'pickup'
      ? 'Konfirmasi Lokasi Penjemputan'
      : 'Konfirmasi Lokasi Tujuan';
  };

  return (
    <View className="bg-white p-4 shadow-lg">
      <View className="mb-3 min-h-[80px] justify-center">
        {!isMapReady
          ? renderLoadingState('Memuat peta...')
          : isLoading || isMapMoving
            ? renderLoadingState('Mendapatkan lokasi...')
            : renderLocationDetails()}
      </View>
      <TouchableOpacity
        onPress={onConfirm}
        disabled={!isMapReady || isLoading || isMapMoving || !locationDetail}
        className={`mb-8 rounded-xl px-4 py-3 shadow-sm ${
          !isMapReady || isLoading || isMapMoving || !locationDetail
            ? 'bg-gray-300'
            : type === 'pickup'
              ? 'bg-blue-600 active:bg-blue-700'
              : 'bg-red-600 active:bg-red-700'
        }`}
      >
        <Text className="text-center text-base font-semibold text-white">
          {getConfirmButtonText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
