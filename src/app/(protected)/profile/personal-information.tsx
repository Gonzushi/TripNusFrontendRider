import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { PersonalInformationField } from '@/features/personal-information';
import { usePersonalInformationForm } from '@/lib/hooks/use-personal-information-form';
import { SafeView } from '@/lib/safe-view';

export default function PersonalInformation() {
  const router = useRouter();
  const {
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    isLoading,
    handleUpdate,
    handleCancel,
  } = usePersonalInformationForm();

  const handleUpdatePress = async () => {
    const result = await handleUpdate();
    if (result.success) {
      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setIsEditing(false);
    } else if (result.error) {
      Alert.alert('Kesalahan', result.error);
    }
  };

  return (
    <SafeView>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-between">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity
                onPress={() => {
                  if (isEditing) {
                    Alert.alert(
                      'Batalkan Perubahan',
                      'Apakah Anda yakin ingin membatalkan perubahan?',
                      [
                        { text: 'Batal', style: 'cancel' },
                        {
                          text: 'Batalkan',
                          style: 'destructive',
                          onPress: () => {
                            handleCancel();
                            router.back();
                          },
                        },
                      ]
                    );
                  } else {
                    router.back();
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-black">
                Informasi Pribadi
              </Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          {/* Main Content */}
          <View className="px-6">
            {/* Header */}
            <View className="mb-8 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="person" size={32} color="#2563EB" />
              </View>
              <Text className="mb-2 text-2xl font-bold text-gray-900">
                {isEditing ? 'Perbarui Profil' : 'Informasi Profil'}
              </Text>
              <Text className="text-center text-base text-gray-600">
                {isEditing
                  ? 'Ubah informasi pribadi Anda'
                  : 'Lihat informasi pribadi Anda'}
              </Text>
            </View>

            {/* Form */}
            <View className="mx-2 space-y-4">
              <PersonalInformationField
                label="Nama Depan"
                value={formData.firstName}
                field="firstName"
                isEditing={isEditing}
                isLoading={isLoading}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, firstName: value }))
                }
              />
              <PersonalInformationField
                label="Nama Belakang"
                value={formData.lastName}
                field="lastName"
                isEditing={isEditing}
                isLoading={isLoading}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, lastName: value }))
                }
              />
              <PersonalInformationField
                label="Nomor Telepon"
                value={formData.phoneNumber}
                field="phoneNumber"
                isEditing={isEditing}
                isLoading={isLoading}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, phoneNumber: value }))
                }
              />
            </View>

            {/* Buttons */}
            <View className="mx-2 mt-8 space-y-4">
              <TouchableOpacity
                className={`${
                  isLoading ? 'bg-blue-300' : 'bg-blue-600'
                } mb-4 flex-row items-center justify-center rounded-xl py-4`}
                onPress={
                  isEditing ? handleUpdatePress : () => setIsEditing(true)
                }
                disabled={isLoading}
              >
                <Ionicons
                  name={isEditing ? 'checkmark' : 'pencil'}
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base font-semibold text-white">
                  {isLoading
                    ? 'Memperbarui...'
                    : isEditing
                      ? 'Perbarui Profil'
                      : 'Ubah Profil'}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-200 py-4"
                >
                  <Text className="text-center font-medium text-gray-600">
                    Batal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer */}
          <View>
            <Text className="mb-12 px-6 text-center text-sm text-gray-500">
              Informasi Anda disimpan dengan aman
            </Text>
          </View>
        </View>
      </View>
    </SafeView>
  );
}
