import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);

  const fetchCurrentStreak = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setCurrentStreak(data?.current_streak || 0);
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  useEffect(() => {
    fetchCurrentStreak();
  }, []);

  const updateStreak = async (increment) => {
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newStreak = Math.max(0, (currentProfile?.current_streak || 0) + increment);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_streak: newStreak })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Update local state after successful update
      setCurrentStreak(newStreak);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

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
          <Text className="text-gray-600">Current Streak: {currentStreak}</Text>
        </View>

        {/* Development Testing Section */}
        <View className="bg-yellow-50 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-2 text-yellow-800">Development Testing</Text>
          <Text className="text-yellow-700 mb-4">⚠️ These controls are for testing purposes only</Text>
          
          <View className="flex-row justify-center space-x-4">
            <TouchableOpacity
              onPress={() => updateStreak(-1)}
              className="bg-red-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">-1 Streak</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => updateStreak(1)}
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">+1 Streak</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 