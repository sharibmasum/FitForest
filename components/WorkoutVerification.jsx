import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWorkoutVerification } from '../hooks/useWorkoutVerification';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function WorkoutVerification() {
  const { user } = useAuth();
  const {
    location,
    errorMsg,
    isInGymRange,
    isWorkoutTime,
    currentWorkoutPlan,
    distanceToGym,
    locationAccuracy,
    forceRefresh,
    isLocationLoading
  } = useWorkoutVerification();

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('workout_plan_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_plans',
          filter: `profile_id=eq.${user.id}`
        },
        async () => {
          // Debounce the refresh to prevent multiple rapid updates
          const now = new Date();
          const lastRefresh = new Date(subscription.lastRefresh || 0);
          const timeSinceLastRefresh = now - lastRefresh;
          
          if (timeSinceLastRefresh > 5000) { // Only refresh if 5 seconds have passed
            await forceRefresh();
            subscription.lastRefresh = now;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, forceRefresh]);

  const formatDistance = (meters) => {
    if (meters === null) return 'Calculating...';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const isActiveWorkoutTime = isWorkoutTime && !!currentWorkoutPlan;

  const getVerificationStatus = () => {
    if (errorMsg) {
      return {
        status: 'error',
        message: errorMsg
      };
    }
    if (isLocationLoading) {
      return {
        status: 'waiting',
        message: 'Getting location...'
      };
    }
    if (!location) {
      return {
        status: 'waiting',
        message: 'Waiting for location...'
      };
    }
    if (!isInGymRange) {
      return {
        status: 'waiting',
        message: `You need to be within 100m of your gym (Currently ${formatDistance(distanceToGym)} away)`
      };
    }
    if (!isActiveWorkoutTime) {
      return {
        status: 'info',
        message: 'No scheduled workout at this time'
      };
    }
    return {
      status: 'active',
      message: "You're at the gym during your workout time! Your streak will update automatically."
    };
  };

  const { status: verificationStatus, message: verificationMessage } = getVerificationStatus();

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <StatusIndicator
          label="Location"
          isActive={!!location}
          message={location ? `Tracking (±${Math.round(locationAccuracy)}m accuracy)` : isLocationLoading ? 'Getting location...' : 'Waiting for location...'}
          details={location ? `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}` : null}
        />
        <StatusIndicator
          label="Gym Range"
          isActive={isInGymRange}
          message={isInGymRange ? 'In range' : `${formatDistance(distanceToGym)} from gym`}
          details={distanceToGym ? `Need to be within 100m (Currently ${formatDistance(distanceToGym)} away)` : null}
        />
        <StatusIndicator
          label="Workout Time"
          isActive={isActiveWorkoutTime}
          message={isActiveWorkoutTime ? 'Active workout time' : 'Outside workout hours'}
          details={isActiveWorkoutTime ? 
            `Scheduled: ${currentWorkoutPlan.start_time.split(':').slice(0,2).join(':')} - ${currentWorkoutPlan.end_time.split(':').slice(0,2).join(':')}` : 
            'No workout scheduled for today'}
        />
      </View>

      <View style={[
        styles.messageContainer,
        verificationStatus === 'active' ? styles.successContainer : 
        verificationStatus === 'error' ? styles.errorContainer : 
        styles.infoContainer,
      ]}>
        <Text style={[
          styles.messageText,
          verificationStatus === 'active' ? styles.successText : 
          verificationStatus === 'error' ? styles.errorText : 
          styles.infoText,
        ]}>
          {verificationMessage}
        </Text>
      </View>
    </View>
  );
}

function StatusIndicator({ label, isActive, message, details }) {
  return (
    <View style={styles.indicatorContainer}>
      <View style={styles.labelContainer}>
        <View style={[styles.dot, isActive ? styles.activeDot : styles.inactiveDot]} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {details && (
        <Text style={styles.details}>{details}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    gap: 16,
    marginBottom: 16,
  },
  indicatorContainer: {
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#FF5252',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
  },
  details: {
    fontSize: 12,
    color: '#888',
    marginLeft: 16,
    marginTop: 2,
  },
  messageContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#2E7D32',
  },
  errorText: {
    color: '#C62828',
  },
  infoText: {
    color: '#1565C0',
  },
}); 