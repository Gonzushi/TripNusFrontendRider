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
        <View className="bg-blue-600 px-4 pb-12 pt-6">
          <View className="items-center">
            <Text className="mb-1 text-2xl font-bold text-white">
              Trip History
            </Text>
            <Text className="text-sm text-white/80">
              View all your past rides and their details
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="-mt-6 flex-row rounded-t-3xl border-b border-gray-100 bg-white px-4 py-5">
          <TouchableOpacity
            className={`rounded-full px-4 py-2 ${
              activeTab === 'all' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setActiveTab('all')}
          >
            <Text
              className={`${
                activeTab === 'all' ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`ml-2 rounded-full px-4 py-2 ${
              activeTab === 'completed' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              className={`${
                activeTab === 'completed' ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`ml-2 rounded-full px-4 py-2 ${
              activeTab === 'cancelled' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setActiveTab('cancelled')}
          >
            <Text
              className={`${
                activeTab === 'cancelled' ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 bg-gray-50">
          <View className="space-y-6 p-4">
            {/* Trip Card */}
            <TouchableOpacity className="my-2 rounded-lg bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-row items-center">
                  <View className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                  <Text className="font-medium text-green-500">Completed</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold">$24.50</Text>
                  <Text className="text-sm text-gray-500">Dec 15, 2024</Text>
                  <Text className="text-sm text-gray-500">2:30 PM</Text>
                </View>
              </View>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="mt-1 w-6 items-center">
                    <View className="h-3 w-3 rounded-full bg-blue-500" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="mb-1 font-medium text-gray-900">
                      Downtown Mall
                    </Text>
                    <Text className="text-sm leading-5 text-gray-500">
                      123 Main Street, City Center
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="mt-1 w-6 items-center">
                    <View className="h-3 w-3 rounded-full bg-red-500" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="mb-1 font-medium text-gray-900">
                      Airport Terminal
                    </Text>
                    <Text className="text-sm leading-5 text-gray-500">
                      456 Airport Blvd, Terminal 2
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4">
                <Ionicons name="car-outline" size={20} color="#6B7280" />
                <Text className="ml-2 text-gray-500">Standard Ride</Text>
                <View className="flex-1 items-end">
                  <View className="flex-row items-center">
                    <Text className="mr-1 text-yellow-500">5.0</Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={14}
                          color="#FCD34D"
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Cancelled Trip Card Example */}
            <TouchableOpacity className="my-2 rounded-lg bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-row items-center">
                  <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                  <Text className="font-medium text-red-500">Cancelled</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold text-gray-400">$0.00</Text>
                  <Text className="text-sm text-gray-500">Dec 10, 2024</Text>
                  <Text className="text-sm text-gray-500">7:45 PM</Text>
                </View>
              </View>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="mt-1 w-6 items-center">
                    <View className="h-3 w-3 rounded-full bg-blue-500" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="mb-1 font-medium text-gray-900">
                      Restaurant Plaza
                    </Text>
                    <Text className="text-sm leading-5 text-gray-500">
                      555 Food Court, Shopping Center
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="mt-1 w-6 items-center">
                    <View className="h-3 w-3 rounded-full bg-gray-400" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="mb-1 font-medium text-gray-900">
                      City Park
                    </Text>
                    <Text className="text-sm leading-5 text-gray-500">
                      777 Green Street, Park Entrance
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4">
                <Ionicons name="car-outline" size={20} color="#6B7280" />
                <Text className="ml-2 text-gray-500">Standard Ride</Text>
                <View className="flex-1 items-end">
                  <Text className="text-red-500">Cancelled by driver</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeView>
  );
}
