import React from 'react';
import { View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TimePickerModal({
  showTimePicker,
  timePickerMode,
  tempTime,
  slideAnim,
  onCancel,
  onConfirm,
  onTimeChange,
  bottomPosition = 85, // Default to 85px from bottom
}) {
  // For Android, we don't render anything here as the native picker is shown directly
  if (!showTimePicker || Platform.OS !== 'ios') return null;

  return (
    <Animated.View 
      className="absolute left-0 right-0 bg-white border-t border-gray-200"
      style={{
        bottom: bottomPosition,
        transform: [{
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0]
          })
        }]
      }}
    >
      <View className="flex-row justify-between items-center px-4 py-2 bg-gray-100">
        <TouchableOpacity onPress={onCancel}>
          <Text className="text-[#556B2F] text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-gray-600 font-medium">
          Set {timePickerMode === 'start' ? 'Start' : 'End'} Time
        </Text>
        <TouchableOpacity onPress={onConfirm}>
          <Text className="text-[#556B2F] text-lg font-medium">
            {timePickerMode === 'start' ? 'Next' : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
      <DateTimePicker
        value={(() => {
          const [hours, minutes] = (timePickerMode === 'start' ? tempTime.start : tempTime.end).split(':');
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes));
          return date;
        })()}
        mode="time"
        is24Hour={false}
        display="spinner"
        onChange={onTimeChange}
      />
    </Animated.View>
  );
} 