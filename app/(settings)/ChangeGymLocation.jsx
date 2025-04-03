import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/ui/BackButton';
import { Ionicons } from '@expo/vector-icons';
import Toast from '../../components/ui/Toast';
import { useSlideNavigation } from '../../hooks/useSlideNavigation';

export default function ChangeGymLocation() {
  const router = useRouter();
  const { user } = useAuth();
  const { goBack } = useSlideNavigation();
  const [location, setLocation] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [currentGym, setCurrentGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch current gym location
        const { data, error } = await supabase
          .from('profiles')
          .select('gym_location')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.gym_location) {
          setCurrentGym(data.gym_location);
        }

        // Get current device location
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
      setToast({
        message: 'Please select a gym location on the map',
        type: 'error'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gym_location: selectedGym,
          gym_location_set: true
        })
        .eq('id', user.id);

      if (error) throw error;

      setToast({
        message: 'Gym location updated successfully!',
        type: 'success'
      });
      
      // Wait for toast to be visible before navigating back
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      setToast({
        message: 'Failed to save gym location. Please try again.',
        type: 'error'
      });
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
    <View className="flex-1 bg-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="pt-2 px-4">
          <BackButton onPress={goBack} />
        </View>
        
        {/* Header */}
        <View className="px-4 pt-8 pb-2">
          <View className="items-center">
            <Text className="text-3xl font-bold text-[#556B2F]">
              Change Gym Location
            </Text>
          </View>
          <Text className="text-gray-600 mt-2 text-center">
            Tap on the map to select your new gym location
          </Text>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <View style={styles.mapBorder}>
            {location && location.coords && (
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
                {currentGym && currentGym.latitude && currentGym.longitude && (
                  <Marker
                    coordinate={currentGym}
                    title="Current Gym"
                    description="Your current gym location"
                  >
                    <View className="bg-[#556B2F] p-2 rounded-full border-2 border-white">
                      <Ionicons name="barbell-outline" size={24} color="white" />
                    </View>
                  </Marker>
                )}
                {selectedGym && selectedGym.latitude && selectedGym.longitude && (
                  <Marker
                    coordinate={selectedGym}
                    title="New Gym"
                    description="Your selected new gym location"
                  >
                    <View className="bg-[#8fbc8f] p-2 rounded-full border-2 border-white">
                      <Ionicons name="barbell" size={24} color="white" />
                    </View>
                  </Marker>
                )}
              </MapView>
            )}
          </View>
        </View>

        {/* Bottom Button */}
        <SafeAreaView edges={['bottom']} className="bg-white w-full">
          <View className="px-4 py-4">
            <TouchableOpacity
              onPress={handleSaveGym}
              className={`py-4 rounded-lg ${!selectedGym ? 'bg-[#8fbc8f]' : 'bg-[#556B2F]'}`}
              disabled={!selectedGym}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save New Location
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
}); 