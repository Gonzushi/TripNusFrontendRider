import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import { type LocationDetail, type SearchBoxInputMode } from '../types';
import LocationInput from './location-input';

type RenderHeaderProps = {
  pickupInputMode: SearchBoxInputMode;
  destinationInputMode: SearchBoxInputMode;
  pickupLocation: LocationDetail;
  destinationLocation: LocationDetail;
  isLoadingLocation: boolean;
  handlePickupPress: () => void;
  handleDestinationPress: () => void;
  handleMapPress: (locationType: 'pickup' | 'destination') => void;
  setPickupLocation: (
    location: LocationDetail | ((prev: LocationDetail) => LocationDetail)
  ) => void;
  setDestinationLocation: (
    location: LocationDetail | ((prev: LocationDetail) => LocationDetail)
  ) => void;
};

export default function RenderHeader({
  pickupInputMode,
  destinationInputMode,
  pickupLocation,
  destinationLocation,
  isLoadingLocation,
  handlePickupPress,
  handleDestinationPress,
  handleMapPress,
  setPickupLocation,
  setDestinationLocation,
}: RenderHeaderProps) {
  return (
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
                        ? 'Mendapatkan lokasi Anda...'
                        : pickupLocation.title
                    }
                    placeholder="Masukkan titik penjemputan"
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
                    placeholder="Masukkan titik tujuan"
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
}
