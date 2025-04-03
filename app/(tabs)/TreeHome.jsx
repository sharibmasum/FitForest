import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import WorkoutVerification from '../../components/WorkoutVerification';
import { useWorkoutVerification } from '../../hooks/useWorkoutVerification';
import { useFocusEffect } from 'expo-router';

export default function TreeHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { location, isInGymRange } = useWorkoutVerification();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data whenever the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  // Initial load and periodic refresh
  useEffect(() => {
    fetchProfile();
    // Set up profile refresh interval
    const intervalId = setInterval(fetchProfile, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  const getLastLocationUpdate = () => {
    if (!location) return 'Waiting for location...';
    const lastUpdate = new Date(location.timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdate) / 1000);
    
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    return `${Math.floor(diffSeconds / 3600)} hours ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-3xl font-bold text-[#556B2F] mb-2">
          Your Forest
        </Text>
        <Text className="text-gray-600 mb-6">
          Welcome {user?.user_metadata?.username}
        </Text>
        
        {/* Location Status */}
        <View className="bg-[#F8F9FA] p-3 rounded-lg mb-4 flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-2 ${location ? 'bg-green-500' : 'bg-gray-400'}`} />
          <View className="flex-1">
            <Text className="text-sm text-gray-600">
              Location Status: {getLastLocationUpdate()}
            </Text>
            {location && (
              <Text className="text-xs text-gray-500">
                {isInGymRange ? '✓ At gym location' : '• Not at gym location'}
              </Text>
            )}
          </View>
        </View>
        
        {/* Streak Display */}
        <View className="bg-[#F5F8F2] p-4 rounded-xl mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold text-[#556B2F] mb-1">
              Current Streak
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="flame" size={24} color="#FF6B2F" />
              <Text className="text-3xl font-bold text-[#556B2F] ml-2">
                {loading ? '...' : profile?.current_streak || 0}
              </Text>
              <Text className="text-lg text-gray-600 ml-2">days</Text>
            </View>
          </View>
          <View>
            <Text className="text-sm text-gray-600 text-right mb-1">
              Longest Streak
            </Text>
            <Text className="text-lg font-semibold text-[#556B2F] text-right">
              {loading ? '...' : profile?.longest_streak || 0} days
            </Text>
          </View>
        </View>

        {/* Workout Verification Status */}
        <WorkoutVerification />
      </View>
    </SafeAreaView>
  );
}
