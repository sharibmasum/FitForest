import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from './useWorkoutPlan';

const LOCATION_TASK_NAME = 'background-location-task';
const GYM_RADIUS_METERS = 100; 
const LOCATION_UPDATE_INTERVAL = 5000; 
const VERIFICATION_INTERVAL = 30000;
const ACCURACY_THRESHOLD = 50; 

export function useWorkoutVerification() {
  const { user } = useAuth();
  const { workoutPlan, fetchWorkoutPlan } = useWorkoutPlan();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isInGymRange, setIsInGymRange] = useState(false);
  const [isWorkoutTime, setIsWorkoutTime] = useState(false);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState(null);
  const [lastVerificationTime, setLastVerificationTime] = useState(null);
  const [distanceToGym, setDistanceToGym] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const locationSubscription = useRef(null);
  const verificationInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if current time is within workout hours
  const checkWorkoutTime = useCallback((plan) => {
    if (!plan) return false;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    
    // Convert current time to 24-hour format
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    const isCorrectDay = plan.day === currentDay;
    const isWithinTime = currentTime >= plan.start_time && currentTime <= plan.end_time;
    
    console.log('Time check:', {
      currentDay,
      planDay: plan.day,
      currentTime,
      startTime: plan.start_time,
      endTime: plan.end_time,
      isCorrectDay,
      isWithinTime
    });
    
    return isCorrectDay && isWithinTime;
  }, []);


  const initializeLocationTracking = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }


      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

 
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 5, 
          mayShowUserSettingsDialog: true, 
        },
        (newLocation) => {
          if (newLocation.coords.accuracy <= ACCURACY_THRESHOLD) {
            setLocation(newLocation);
            setLocationAccuracy(newLocation.coords.accuracy);
            checkGymProximity(newLocation.coords);
          } else {
            console.log('Location accuracy too low:', newLocation.coords.accuracy);
          }
        }
      );

      locationSubscription.current = subscription;
    } catch (error) {
      setErrorMsg('Error initializing location tracking');
      console.error(error);
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
        const isInRange = distance <= GYM_RADIUS_METERS;

        console.log('Distance check:', {
          currentLocation: {
            latitude: currentCoords.latitude.toFixed(6),
            longitude: currentCoords.longitude.toFixed(6),
            accuracy: currentCoords.accuracy
          },
          gymLocation: {
            latitude: gymLocation.latitude.toFixed(6),
            longitude: gymLocation.longitude.toFixed(6)
          },
          distance: Math.round(distance),
          isInRange,
          accuracy: currentCoords.accuracy
        });

        setIsInGymRange(isInRange);
      }
    } catch (error) {
      console.error('Error checking gym proximity:', error);
    }
  }, [user]);

  
  const checkWorkoutCompletion = async (workoutPlanId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('completed_workouts')
      .select('*')
      .eq('profile_id', user.id)
      .eq('workout_plan_id', workoutPlanId)
      .gte('completed_at', today.toISOString())
      .lt('completed_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking workout completion:', error);
      return true; 
    }

    return data && data.length > 0;
  };


  const verifyWorkout = useCallback(async () => {
    console.log('Starting workout verification:', {
      hasUser: !!user,
      isInGymRange,
      isWorkoutTime,
      currentWorkoutPlan
    });

    if (!user || !isInGymRange || !isWorkoutTime || !currentWorkoutPlan) {
      console.log('Verification conditions not met');
      return;
    }

    const now = new Date();
    if (lastVerificationTime && (now - lastVerificationTime) < VERIFICATION_INTERVAL) {
      console.log('Too soon since last verification attempt');
      return;
    }

    setLastVerificationTime(now);

    try {
      const alreadyCompleted = await checkWorkoutCompletion(currentWorkoutPlan.id);
      if (alreadyCompleted) {
        console.log('Workout already completed today');
        return;
      }

      
      const { data: completedWorkout, error: completionError } = await supabase
        .from('completed_workouts')
        .insert([{
          profile_id: user.id,
          workout_plan_id: currentWorkoutPlan.id,
          location_verified: true
        }])
        .select()
        .single();

      if (completionError) throw completionError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const newCurrentStreak = profile.current_streak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, profile.longest_streak);

      console.log('Updating streak:', {
        oldStreak: profile.current_streak,
        newStreak: newCurrentStreak,
        newLongestStreak
      });

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return completedWorkout;
    } catch (error) {
      console.error('Error verifying workout:', error);
      throw error;
    }
  }, [user, isInGymRange, isWorkoutTime, currentWorkoutPlan, lastVerificationTime]);

 
  useEffect(() => {
    if (isInGymRange && isWorkoutTime && currentWorkoutPlan) {
      // Clear any existing interval
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

  
  useEffect(() => {
    if (!workoutPlan || !location) return;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const todaysPlan = workoutPlan.find(plan => plan.day === currentDay);

    console.log('Checking workout status:', {
      currentDay,
      hasTodaysPlan: !!todaysPlan,
      workoutPlan
    });

    if (todaysPlan) {
      setCurrentWorkoutPlan(todaysPlan);
      setIsWorkoutTime(checkWorkoutTime(todaysPlan));
    } else {
      setCurrentWorkoutPlan(null);
      setIsWorkoutTime(false);
    }
  }, [workoutPlan, location, checkWorkoutTime]);


  useEffect(() => {
    initializeLocationTracking();
    fetchWorkoutPlan();

    return () => {
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
    locationAccuracy
  };
} 