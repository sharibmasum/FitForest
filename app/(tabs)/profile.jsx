import React from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-3xl font-bold text-[#556B2F] mb-6">
          Profile
        </Text>

        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-[#556B2F] mb-4 items-center justify-center">
            <Text className="text-3xl text-white font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </Text>
          </View>
          <Text className="text-xl font-semibold">{user?.email}</Text>
        </View>

        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-2">Stats</Text>
          <Text className="text-gray-600">Workouts completed: 0</Text>
          <Text className="text-gray-600">Trees grown: 0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 