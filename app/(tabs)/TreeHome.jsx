import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TreeHome() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-3xl font-bold text-[#556B2F] mb-2">
          Your Forest
        </Text>
        <Text className="text-gray-600 mb-6">
          Welcome back, {user?.email}
        </Text>
        
        {/* Placeholder for tree/fitness progress visualization */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-700 mb-8">
            Your progress visualization will appear here
          </Text>

          <TouchableOpacity 
            onPress={signOut}
            className="bg-[#556B2F] px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
