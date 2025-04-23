import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from './useWorkoutPlan';

const GYM_RADIUS_METERS = 100; 
const LOCATION_UPDATE_INTERVAL = 30000;
const VERIFICATION_INTERVAL = 60000;
const ACCURACY_THRESHOLD = 500;

export function useWorkoutVerification() {
  const { user } = useAuth();
  const { workoutPlan, fetchWorkoutPlan: fetchPlan } = useWorkoutPlan();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isInGymRange, setIsInGymRange] = useState(false);
  const [isWorkoutTime, setIsWorkoutTime] = useState(false);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState(null);
  const [lastVerificationTime, setLastVerificationTime] = useState(null);
  const [distanceToGym, setDistanceToGym] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const locationSubscription = useRef(null);
  const verificationInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  const checkWorkoutTime = useCallback((plan) => {
    if (!plan || !plan.start_time || !plan.end_time) return false;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startHours, startMinutes] = plan.start_time.split(':').map(Number);
    const [endHours, endMinutes] = plan.end_time.split(':').map(Number);
    const planStartMinutes = startHours * 60 + startMinutes;
    const planEndMinutes = endHours * 60 + endMinutes;
    
    return plan.day === currentDay && currentMinutes >= planStartMinutes && currentMinutes <= planEndMinutes;
  }, []);

  const fetchWorkoutPlan = useCallback(async () => {
    try {
      await fetchPlan();
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const todaysPlan = workoutPlan?.find(plan => plan.day === currentDay);

      if (!todaysPlan) {
        setIsWorkoutTime(false);
        setCurrentWorkoutPlan(null);
        setLastVerificationTime(null);
        return;
      }

      const isWithinTime = checkWorkoutTime(todaysPlan);
      setCurrentWorkoutPlan(todaysPlan);
      setIsWorkoutTime(isWithinTime);
      if (isWithinTime) {
        setLastVerificationTime(new Date());
      }
    } catch (error) {
      console.error('Error in fetchWorkoutPlan:', error);
      setIsWorkoutTime(false);
      setCurrentWorkoutPlan(null);
      setLastVerificationTime(null);
    }
  }, [workoutPlan, checkWorkoutTime, fetchPlan]);

  const forceRefresh = useCallback(async () => {
    setLastVerificationTime(null);
    await fetchWorkoutPlan();
  }, [fetchWorkoutPlan]);

  const forceLocationCheck = useCallback(async () => {
    try {
      setIsLocationLoading(true);
      setErrorMsg(null);

      // Get current location with high accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 5000,
      });
      
      setLocation(currentLocation);
      setLocationAccuracy(currentLocation.coords.accuracy);
      await checkGymProximity(currentLocation.coords);
      setIsLocationLoading(false);
    } catch (error) {
      console.error('Error forcing location check:', error);
      setErrorMsg('Error getting current location');
      setIsLocationLoading(false);
    }
  }, [checkGymProximity]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const initializeLocationTracking = async (force = false) => {
    try {
      // If we already have a location and a subscription, and not forcing, don't reinitialize
      if (location && locationSubscription.current && !force) {
        setIsLocationLoading(false);
        return;
      }
      
      setIsLocationLoading(true);
      setErrorMsg(null);

      // Check if we already have permission before requesting
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      if (currentStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setIsLocationLoading(false);
          return;
        }
      }

      // Clear any existing subscription before creating a new one
      if (locationSubscription.current) {
        await locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      // Get initial location with balanced accuracy
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000,
        });
        
        setLocation(initialLocation);
        setLocationAccuracy(initialLocation.coords.accuracy);
        checkGymProximity(initialLocation.coords);
        setIsLocationLoading(false);
      } catch (error) {
        console.warn('Initial location fetch failed:', error);
        setIsLocationLoading(false);
      }

      // Start watching for updates with balanced accuracy
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 100,
        },
        (newLocation) => {
          if (newLocation.coords.accuracy <= ACCURACY_THRESHOLD) {
            setLocation(newLocation);
            setLocationAccuracy(newLocation.coords.accuracy);
            checkGymProximity(newLocation.coords);
            setIsLocationLoading(false);
          }
        }
      );

      locationSubscription.current = subscription;
    } catch (error) {
      console.error('Error initializing location tracking:', error);
      setErrorMsg('Error initializing location tracking. Please check your location settings.');
      setIsLocationLoading(false);
    }
  };

  const checkGymProximity = useCallback(async (currentCoords) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gym_location')
        .eq('id', user.id)
        .single();

      if (profile?.gym_location) {
        const gymLocation = profile.gym_location;
        const distance = calculateDistance(
          currentCoords.latitude,
          currentCoords.longitude,
          gymLocation.latitude,
          gymLocation.longitude
        );

        setDistanceToGym(distance);
        setIsInGymRange(distance <= GYM_RADIUS_METERS);
      }
    } catch (error) {
      console.error('Error checking gym proximity:', error);
    }
  }, [user]);

  const verifyWorkout = useCallback(async () => {
    if (!user || !currentWorkoutPlan || !isWorkoutTime || !isInGymRange) return;

    try {
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('id', currentWorkoutPlan.id)
        .single();

      if (planError || !plan) {
        console.error('Workout plan not found:', currentWorkoutPlan.id);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: completedWorkouts, error: completedError } = await supabase
        .from('completed_workouts')
        .select('*')
        .eq('profile_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (completedError) throw completedError;
      if (completedWorkouts?.length > 0) return;

      const { error: insertError } = await supabase
        .from('completed_workouts')
        .insert([
          {
            profile_id: user.id,
            workout_plan_id: currentWorkoutPlan.id,
            completed_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const newStreak = (profile.current_streak || 0) + 1;
      const newLongestStreak = Math.max(newStreak, profile.longest_streak || 0);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setLastVerificationTime(new Date());
    } catch (error) {
      console.error('Error verifying workout:', error);
      throw error;
    }
  }, [user, currentWorkoutPlan, isWorkoutTime, isInGymRange]);

  useEffect(() => {
    if (isInGymRange && isWorkoutTime && currentWorkoutPlan) {
      if (verificationInterval.current) {
        clearInterval(verificationInterval.current);
      }

      verificationInterval.current = setInterval(() => {
        verifyWorkout();
      }, VERIFICATION_INTERVAL);

      verifyWorkout();
    }

    return () => {
      if (verificationInterval.current) {
        clearInterval(verificationInterval.current);
      }
    };
  }, [isInGymRange, isWorkoutTime, currentWorkoutPlan, verifyWorkout]);

  useEffect(() => {
    initializeLocationTracking();
    fetchWorkoutPlan();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [fetchWorkoutPlan]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        initializeLocationTracking();
        fetchWorkoutPlan();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (verificationInterval.current) {
        clearInterval(verificationInterval.current);
      }
    };
  }, []);

  return {
    location,
    errorMsg,
    isInGymRange,
    isWorkoutTime,
    currentWorkoutPlan,
    verifyWorkout,
    distanceToGym,
    locationAccuracy,
    fetchWorkoutPlan,
    forceRefresh,
    forceLocationCheck,
    isLocationLoading
  };
} 