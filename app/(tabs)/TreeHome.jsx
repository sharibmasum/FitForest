import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutVerification } from '../../hooks/useWorkoutVerification';
import { ScrollView } from 'react-native-gesture-handler';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import LocationStatus from '../../components/tree-home/LocationStatus';
import StreakDisplay from '../../components/tree-home/StreakDisplay';
import LocationPermissionModal from '../../components/tree-home/LocationPermissionModal';
import WorkoutVerificationModal from '../../components/tree-home/WorkoutVerificationModal';
import TreeAnimation from '../../components/tree-home/TreeAnimation';

export default function TreeHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const permissionRequested = useRef(false);
  const { 
    location, 
    isInGymRange, 
    fetchWorkoutPlan, 
    forceRefresh, 
    isWorkoutTime,
    currentWorkoutPlan,
    isLocationLoading,
    errorMsg,
    initializeLocationTracking,
    forceLocationCheck
  } = useWorkoutVerification();
  
  const isActiveWorkoutTime = isWorkoutTime && !!currentWorkoutPlan;

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const refreshPromises = [
        forceRefresh(),
        fetchProfile(),
        forceLocationCheck()
      ];
      
      await Promise.all(refreshPromises);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [forceRefresh, fetchProfile, forceLocationCheck]);

  // Check location permissions and initialize tracking
  useEffect(() => {
    let isMounted = true;
    
    const checkLocationPermission = async () => {
      try {
        if (permissionRequested.current) return;
        permissionRequested.current = true;

        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (!isMounted) return;

        if (status !== 'granted') {
          setShowLocationModal(true);
        } else {
          setShowLocationModal(false);
          if (typeof initializeLocationTracking === 'function') {
            await initializeLocationTracking();
          }
        }
      } catch (error) {
        console.error('Error checking location permission:', error);
        if (isMounted) {
          setShowLocationModal(true);
        }
      }
    };
    
    checkLocationPermission();

    return () => {
      isMounted = false;
    };
  }, [initializeLocationTracking]);

  // Set up subscription to profile changes
  useEffect(() => {
    if (!user) return;

    const profileSubscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    Promise.all([
      fetchProfile(),
      fetchWorkoutPlan()
    ]).catch(error => {
      console.error('Error in initial fetch:', error);
    });

    return () => {
      profileSubscription.unsubscribe();
    };
  }, [user.id, fetchWorkoutPlan]);

  useEffect(() => {
    const updateInterval = setInterval(async () => {
      await fetchProfile();
    }, 300000);

    return () => clearInterval(updateInterval);
  }, [fetchProfile]);

  useEffect(() => {
    const appState = { current: AppState.currentState };
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const now = new Date();
        const lastUpdate = new Date(appState.current === 'background' ? appState.lastUpdate : now);
        const timeSinceLastUpdate = now - lastUpdate;
        
        if (timeSinceLastUpdate > 300000) {
          Promise.all([
            forceRefresh(),
            fetchProfile()
          ]).catch(error => {
            console.error('Error refreshing data on app state change:', error);
          });
        }
      }
      appState.current = nextAppState;
      appState.lastUpdate = new Date();
    });

    return () => {
      subscription.remove();
    };
  }, [forceRefresh, fetchProfile]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 py-2">
        <Text className="text-3xl font-bold text-[#556B2F]">
          Your Forest
        </Text>
        <TouchableOpacity 
          onPress={() => setShowWorkoutModal(true)}
          className="p-2"
        >
          <Ionicons name="fitness-outline" size={24} color="#556B2F" />
        </TouchableOpacity>
      </View>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#556B2F"
            title="Pull to refresh"
            titleColor="#556B2F"
          />
        }
      >
        <View className="flex-1 p-4">
          <Text className="text-gray-600 mb-6">
            Welcome {user?.user_metadata?.username}
          </Text>
          
          <LocationStatus
            location={location}
            isInGymRange={isInGymRange}
            isActiveWorkoutTime={isActiveWorkoutTime}
            isLocationLoading={isLocationLoading || refreshing}
            errorMsg={errorMsg}
          />
          
          <StreakDisplay
            loading={loading}
            profile={profile}
          />
          
          <TreeAnimation streak={profile?.current_streak || 0} />
        </View>
      </ScrollView>

      <LocationPermissionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      <WorkoutVerificationModal
        visible={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
      />
    </SafeAreaView>
  );
}
