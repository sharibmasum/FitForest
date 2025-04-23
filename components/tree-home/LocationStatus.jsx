import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function LocationStatus({ 
  location, 
  isInGymRange, 
  isActiveWorkoutTime, 
  isLocationLoading, 
  errorMsg 
}) {
  const getLastLocationUpdate = () => {
    if (errorMsg) return 'Location error';
    if (!location) return isLocationLoading ? 'Getting location...' : 'Waiting for location...';
    
    const lastUpdate = new Date(location.timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdate) / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    return `${Math.floor(diffSeconds / 3600)} hours ago`;
  };

  return (
    <View className={`p-3 rounded-lg mb-4 flex-row items-center ${isActiveWorkoutTime ? 'bg-[#EDF7ED]' : 'bg-[#F8F9FA]'}`}>
      <View className="flex-1">
        <Text className="text-sm text-gray-600">
          Location Status: {isLocationLoading ? 'Refreshing location...' : getLastLocationUpdate()}
        </Text>
        {errorMsg && (
          <Text className="text-xs text-red-500">
            {errorMsg}
          </Text>
        )}
        {location && !errorMsg && !isLocationLoading && (
          <>
            <Text className={`text-xs ${isInGymRange ? 'text-green-600' : 'text-gray-500'}`}>
              {isInGymRange ? '✓ At gym location' : '• Not at gym location'}
            </Text>
            <Text className={`text-xs ${isActiveWorkoutTime ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
              {isActiveWorkoutTime ? '✓ During workout hours' : '• Not during workout hours'}
            </Text>
          </>
        )}
      </View>
      {isLocationLoading && (
        <ActivityIndicator size="small" color="#556B2F" />
      )}
    </View>
  );
} 