import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWorkoutVerification } from '../hooks/useWorkoutVerification';

export default function WorkoutVerification() {
  const {
    location,
    errorMsg,
    isInGymRange,
    isWorkoutTime,
    currentWorkoutPlan,
    distanceToGym,
    locationAccuracy
  } = useWorkoutVerification();

  const [verificationStatus, setVerificationStatus] = useState('waiting');
  const [verificationMessage, setVerificationMessage] = useState('');

  const formatDistance = (meters) => {
    if (meters === null) return 'Calculating...';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  useEffect(() => {
    if (!location) {
      setVerificationStatus('waiting');
      setVerificationMessage('Waiting for location...');
    } else if (!isInGymRange) {
      setVerificationStatus('waiting');
      setVerificationMessage(`You need to be within 100m of your gym (Currently ${formatDistance(distanceToGym)} away)`);
    } else if (!isWorkoutTime || !currentWorkoutPlan) {
      setVerificationStatus('info');
      setVerificationMessage('No scheduled workout at this time');
    } else {
      setVerificationStatus('active');
      setVerificationMessage("You're at the gym during your workout time! Your streak will update automatically.");
    }
  }, [location, isInGymRange, isWorkoutTime, currentWorkoutPlan, distanceToGym]);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <StatusIndicator
          label="Location"
          isActive={!!location}
          message={location ? `Tracking (±${Math.round(locationAccuracy)}m accuracy)` : 'Waiting for location...'}
          details={location ? `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}` : null}
        />
        <StatusIndicator
          label="Gym Range"
          isActive={isInGymRange}
          message={isInGymRange ? 'In range' : `${formatDistance(distanceToGym)} from gym`}
          details={distanceToGym ? `Need to be within 200m (Currently ${formatDistance(distanceToGym)} away)` : null}
        />
        <StatusIndicator
          label="Workout Time"
          isActive={isWorkoutTime}
          message={isWorkoutTime ? 'Active workout time' : 'Outside workout hours'}
          details={currentWorkoutPlan ? `Scheduled: ${currentWorkoutPlan.start_time} - ${currentWorkoutPlan.end_time}` : 'No workout scheduled'}
        />
      </View>

      <View style={[
        styles.messageContainer,
        verificationStatus === 'active' && styles.successContainer,
        verificationStatus === 'error' && styles.errorContainer,
        verificationStatus === 'info' && styles.infoContainer,
      ]}>
        <Text style={[
          styles.messageText,
          verificationStatus === 'active' && styles.successText,
          verificationStatus === 'error' && styles.errorText,
          verificationStatus === 'info' && styles.infoText,
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