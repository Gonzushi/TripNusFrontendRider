import { SafeView } from '@/lib/safe-view';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function Activity() {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'cancelled'>(
    'all'
  );

  return (
    <SafeView
      isShowingTabBar={true}
      statusBarStyle="light"
      statusBackgroundColor="bg-blue-600"
    >
      <View className="flex-1 bg-white">
        {/* Enhanced Header */}
        <View className="bg-blue-600 px-4 pt-6 pb-12">
          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-1">
              Trip History
            </Text>
            <Text className="text-white/80 text-sm">
              View all your past rides and their details
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 py-5 bg-white border-b border-gray-100 -mt-6 rounded-t-3xl">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
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
            className={`px-4 py-2 rounded-full ml-2 ${
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
            className={`px-4 py-2 rounded-full ml-2 ${
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
          <View className="p-4 space-y-6">
            {/* Trip Card */}
            <TouchableOpacity className="bg-white rounded-lg p-5 shadow-sm my-2">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  <Text className="text-green-500 font-medium">Completed</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold">$24.50</Text>
                  <Text className="text-sm text-gray-500">Dec 15, 2024</Text>
                  <Text className="text-sm text-gray-500">2:30 PM</Text>
                </View>
              </View>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="w-6 items-center mt-1">
                    <View className="h-3 w-3 rounded-full bg-blue-500" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-gray-900 font-medium mb-1">
                      Downtown Mall
                    </Text>
                    <Text className="text-sm text-gray-500 leading-5">
                      123 Main Street, City Center
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="w-6 items-center mt-1">
                    <View className="h-3 w-3 rounded-full bg-red-500" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-gray-900 font-medium mb-1">
                      Airport Terminal
                    </Text>
                    <Text className="text-sm text-gray-500 leading-5">
                      456 Airport Blvd, Terminal 2
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
                <Ionicons name="car-outline" size={20} color="#6B7280" />
                <Text className="text-gray-500 ml-2">Standard Ride</Text>
                <View className="flex-1 items-end">
                  <View className="flex-row items-center">
                    <Text className="text-yellow-500 mr-1">5.0</Text>
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
            <TouchableOpacity className="bg-white rounded-lg p-5 shadow-sm my-2">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                  <Text className="text-red-500 font-medium">Cancelled</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold text-gray-400">$0.00</Text>
                  <Text className="text-sm text-gray-500">Dec 10, 2024</Text>
                  <Text className="text-sm text-gray-500">7:45 PM</Text>
                </View>
              </View>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="w-6 items-center mt-1">
                    <View className="h-3 w-3 rounded-full bg-blue-500" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-gray-900 font-medium mb-1">
                      Restaurant Plaza
                    </Text>
                    <Text className="text-sm text-gray-500 leading-5">
                      555 Food Court, Shopping Center
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="w-6 items-center mt-1">
                    <View className="h-3 w-3 rounded-full bg-gray-400" />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-gray-900 font-medium mb-1">
                      City Park
                    </Text>
                    <Text className="text-sm text-gray-500 leading-5">
                      777 Green Street, Park Entrance
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
                <Ionicons name="car-outline" size={20} color="#6B7280" />
                <Text className="text-gray-500 ml-2">Standard Ride</Text>
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
