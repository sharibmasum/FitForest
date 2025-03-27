import React from 'react';
import { TouchableOpacity, Image, SafeAreaView } from 'react-native';

export default function BackButton({ onPress }) {
  return (
    <SafeAreaView className="absolute left-0 top-0 z-50">
      <TouchableOpacity 
        onPress={onPress}
        className="p-4"
      >
        <Image 
          source={require('../../assets/back.png')}
          style={{ width: 24, height: 24 }}
          tintColor="#556B2F"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
} 