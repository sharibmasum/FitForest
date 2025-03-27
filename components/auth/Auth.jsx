import React from 'react';
import SignIn from '../../app/(auth)/SignIn';
import SignUp from '../../app/(auth)/SignUp';
import Welcome from '../../app/(auth)/Welcome';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const { screen, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#556B2F" />
      </View>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'signin':
        return <SignIn />;
      case 'signup':
        return <SignUp />;
      default:
        return <Welcome />;
    }
  };

  return renderScreen();
} 