import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StreakDisplay({ loading, profile }) {
  return (
    <View className="p-4 rounded-xl mb-6 flex-row justify-between items-center bg-[#F5F8F2]">
      <View>
        <Text className="text-lg font-semibold text-[#556B2F] mb-1">
          Current Streak
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="flame" size={24} color="#FF6B2F" />
          <Text className="text-3xl font-bold text-[#556B2F] ml-2">
            {loading ? '-' : profile?.current_streak || 0}
          </Text>
          <Text className="text-lg text-gray-600 ml-2">days</Text>
        </View>
      </View>
      <View>
        <Text className="text-sm text-gray-600 text-right mb-1">
          Longest Streak
        </Text>
        <Text className="text-lg font-semibold text-[#556B2F] text-right">
          {loading ? '-' : profile?.longest_streak || 0} days
        </Text>
      </View>
    </View>
  );
} 