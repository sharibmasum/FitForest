import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { useEffect } from 'react';

export default function TabsLayout() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { workoutPlan, fetchWorkoutPlan, loading: planLoading } = useWorkoutPlan();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkoutPlan();
    }
  }, [isAuthenticated]);

  // Show loading indicator while checking auth and plan
  if (authLoading || (isAuthenticated && planLoading)) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#556B2F" />
      </View>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#556B2F',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          backgroundColor: 'white',
          height: 85,
          paddingBottom: 25,
          paddingTop: 5,
        }
      }}
    >
      <Tabs.Screen
        name="TreeHome"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SetWorkoutPlan"
        options={{
          title: 'Set Plan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 