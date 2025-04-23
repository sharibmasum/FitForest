import React from 'react';
import { View, Text, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LocationPermissionModal({ visible, onClose }) {
  const openSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl p-6 w-[90%] max-w-md">
          <View className="items-center mb-4">
            <Ionicons name="location" size={48} color="#556B2F" />
          </View>
          <Text className="text-xl font-bold text-center text-[#556B2F] mb-2">
            Location Services Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            FitForest needs access to your location to verify your gym visits and track your workout streaks. Please enable location services to continue.
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200"
            >
              <Text className="text-gray-700 font-medium">Not Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openSettings}
              className="px-4 py-2 rounded-lg bg-[#556B2F]"
            >
              <Text className="text-white font-medium">Open Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 