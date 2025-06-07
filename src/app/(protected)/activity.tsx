import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { SafeView } from '@/lib/safe-view';

export default function Activity() {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'cancelled'>(
    'all'
  );

  return (
    <SafeView
      isShowingTabBar={true}
      isShowingPaddingTop={true}
      statusBarStyle="light"
      statusBackgroundColor="bg-blue-600"
    >
      <View className="flex-1 bg-white">
        {/* Enhanced Header */}
        <View className="-mb-4 bg-blue-600 px-4 pb-16 pt-4">
          <View className="items-center">
            <Text className="mb-1 text-xl font-bold text-white">
              Riwayat Perjalanan
            </Text>
            <Text className="text-xs text-white/80">
              Lihat semua perjalanan Anda sebelumnya
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="-mt-4 flex-row rounded-t-3xl border-b border-gray-100 bg-white px-4 py-3">
          <TouchableOpacity
            className={`rounded-full px-4 py-1.5 ${
              activeTab === 'all' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setActiveTab('all')}
          >
            <Text
              className={`text-sm ${
                activeTab === 'all' ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`ml-2 rounded-full px-4 py-1.5 ${
              activeTab === 'completed' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              className={`text-sm ${
                activeTab === 'completed' ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              Selesai
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`ml-2 rounded-full px-4 py-1.5 ${
              activeTab === 'cancelled' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setActiveTab('cancelled')}
          >
            <Text
              className={`text-sm ${
                activeTab === 'cancelled' ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              Dibatalkan
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 bg-white">
          <View className="space-y-3 p-4">
            {/* Trip Card */}
            <TouchableOpacity className="rounded-2xl border border-blue-100 bg-blue-50 shadow-sm">
              <View className="px-3 py-3">
                {/* Status and Icon */}
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-50/90">
                      <Ionicons name="car" size={24} color="#3B82F6" />
                    </View>
                    <Text className="ml-4 text-sm text-gray-900">
                      Standard Ride • 4.2 km • 15 menit
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-medium text-green-600">
                      Selesai
                    </Text>
                    <Text className="px-1.5 text-green-600">•</Text>
                  </View>
                </View>

                {/* Route Info */}
                <View className="mt-1 space-y-1.5">
                  <View className="flex-row">
                    <View className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                    <View className="flex-1 pl-3">
                      <Text
                        className="text-sm font-medium text-gray-900"
                        numberOfLines={1}
                      >
                        Downtown Mall
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        123 Main Street, City Center
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row">
                    <View className="mt-1.5 h-2 w-2 rounded-full bg-red-500" />
                    <View className="flex-1 pl-3">
                      <Text
                        className="text-sm font-medium text-gray-900"
                        numberOfLines={1}
                      >
                        Airport Terminal
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        456 Airport Blvd, Terminal 2
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Info */}
                <View className="mt-2 flex-row items-center justify-between border-t border-blue-200 pt-2">
                  <View>
                    <Text className="text-lg font-bold text-gray-800">
                      Rp 24.500
                    </Text>
                    <Text className="text-[11px] text-gray-600">
                      15 Des 2024 • 14:30
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="mr-1 text-xs text-yellow-500">5.0</Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={12}
                          color="#FCD34D"
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Cancelled Trip Card */}
            <TouchableOpacity className="my-4 rounded-2xl border border-red-100 bg-red-50 shadow-sm">
              <View className="px-3 py-3">
                {/* Status and Icon */}
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50/90">
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </View>
                    <Text className="ml-4 text-sm text-gray-900">
                      Standard Ride • 2.8 km • 10 menit
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-medium text-red-600">
                      Dibatalkan
                    </Text>
                    <Text className="px-1.5 text-red-600">•</Text>
                  </View>
                </View>

                {/* Route Info */}
                <View className="mt-1 space-y-1.5">
                  <View className="flex-row">
                    <View className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                    <View className="flex-1 pl-3">
                      <Text
                        className="text-sm font-medium text-gray-900"
                        numberOfLines={1}
                      >
                        Restaurant Plaza
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        555 Food Court, Shopping Center
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row">
                    <View className="mt-1.5 h-2 w-2 rounded-full bg-gray-400" />
                    <View className="flex-1 pl-3">
                      <Text
                        className="text-sm font-medium text-gray-900"
                        numberOfLines={1}
                      >
                        City Park
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        777 Green Street, Park Entrance
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Info */}
                <View className="mt-2 flex-row items-center justify-between border-t border-red-200 pt-2">
                  <View>
                    <Text className="text-lg font-bold text-gray-400">
                      Rp 0
                    </Text>
                    <Text className="text-[11px] text-gray-600">
                      10 Des 2024 • 19:45
                    </Text>
                  </View>
                  <Text className="text-xs text-red-500">
                    Dibatalkan oleh pengemudi
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeView>
  );
}
