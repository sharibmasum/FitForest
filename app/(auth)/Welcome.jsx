import React from 'react';
import { Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import AuthLayout from './_layout';
import { useAuth } from '../../context/AuthContext';

export default function Welcome() {
  const { handleNavigation } = useAuth();

  return (
    <AuthLayout showTitle={false}>
      <View className="items-center mb-8">
        <Text className="text-4xl font-bold text-[#556B2F] mb-2">FitForest</Text>
        <Text className="text-lg text-gray-600">Grow your goals, one gym trip at a time.</Text>
      </View>

      <Button
        title="Get Started"
        onPress={() => handleNavigation('signup')}
      />

      <Button
        title="I already have an account"
        onPress={() => handleNavigation('signin')}
        variant="secondary"
      />
    </AuthLayout>
  );
} 