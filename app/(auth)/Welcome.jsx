import React from 'react';
import { Text, View, Image } from 'react-native';
import Button from '../../components/ui/Button';
import AuthLayout from './_layout';
import { useAuth } from '../../context/AuthContext';

export default function Welcome() {
  const { handleNavigation } = useAuth();

  return (
    <AuthLayout showTitle={false}>
      <View className="items-center">
        <Image 
          source={require('../../assets/FitForestLogoNoText-removebg.png')}
          className="w-72 h-72"
          resizeMode="contain"
        />
        <Text className="text-4xl font-bold text-[#556B2F] -mt-8">FitForest</Text>
        <Text className="text-lg text-gray-600 mb-8">Grow your goals, one gym trip at a time.</Text>
      </View>

      <View className="w-full items-center">
        <Button
          title="Get Started"
          onPress={() => handleNavigation('signup')}
          className="mb-4"
        />

        <Button 
          title="Have an account?"
          onPress={() => handleNavigation('signin')}
          variant="secondary"
        />
      </View>
    </AuthLayout>
  );
} 