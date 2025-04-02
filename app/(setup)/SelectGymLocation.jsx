import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectGymLocation() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Please enable location services to select your gym location.');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location);
        setLoading(false);
      } catch (error) {
        setErrorMsg('Unable to access location. Please check your device settings.');
        setLoading(false);
      }
    })();
  }, []);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedGym(coordinate);
  };

  const handleSaveGym = async () => {
    if (!selectedGym) {
      Alert.alert('Error', 'Please select a gym location on the map');
      return;
    }

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Save the gym location to the user's profile
      const { error } = await supabase
        .from('profiles')
        .update({
          gym_location: selectedGym,
          gym_location_set: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // Check if user has a workout plan
      const { data: workoutPlan } = await supabase
        .from('workout_days')
        .select('*')
        .eq('user_id', user.id);

      // If no workout plan exists, go to workout plan setup
      if (!workoutPlan || workoutPlan.length === 0) {
        router.push('/InitializeWorkoutPlan');
      } else {
        // If they already have a workout plan, go straight to home
        router.replace('/(tabs)/TreeHome');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save gym location. Please try again.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#556B2F" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-red-500 text-center text-lg mb-4">{errorMsg}</Text>
        <TouchableOpacity
          onPress={async () => {
            setLoading(true);
            setErrorMsg(null);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              let location = await Location.getCurrentPositionAsync({});
              setLocation(location);
              setLoading(false);
            } else {
              setErrorMsg('Please enable location services to select your gym location.');
              setLoading(false);
            }
          }}
          className="bg-[#556B2F] px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600 text-center text-lg">
          Unable to get your location. Please check your device settings and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View className="px-4 pt-4">
          <Text className="text-3xl font-bold text-[#556B2F]">
            Select Your Home Gym
          </Text>
          <Text className="text-gray-600 mt-2">
            Tap on the map to select your nearest gym location
          </Text>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <View style={styles.mapBorder}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {selectedGym && (
                <Marker
                  coordinate={selectedGym}
                  title="Selected Gym"
                  description="Your chosen gym location"
                />
              )}
            </MapView>
          </View>
        </View>

        {/* Bottom Button */}
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          <View className="px-4 py-4">
            <TouchableOpacity
              onPress={handleSaveGym}
              className={`py-4 rounded-lg ${!selectedGym ? 'bg-[#8fbc8f]' : 'bg-[#556B2F]'}`}
              disabled={!selectedGym}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save Gym Location
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    position: 'relative',
  },
  mapBorder: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#556B2F',
    overflow: 'hidden',
    marginVertical: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    backgroundColor: 'white',
    width: '100%',
  },
}); 