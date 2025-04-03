import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DaySelector({
  day,
  isSelected,
  times,
  onPress,
  formatTime
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 mb-4 rounded-lg border ${
        isSelected
          ? 'bg-[#556B2F] border-[#556B2F]'
          : 'bg-white border-gray-200'
      }`}
    >
      <Text
        className={`text-lg capitalize ${
          isSelected ? 'text-white font-medium' : 'text-gray-700'
        }`}
      >
        {day}
      </Text>
      
      {isSelected && times[day] && (
        <View className="flex-row items-center">
          <Text className={isSelected ? 'text-white' : 'text-gray-700'}>
            {formatTime(times[day].start)} - {formatTime(times[day].end)}
          </Text>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="white"
            style={{ marginLeft: 8 }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
} 