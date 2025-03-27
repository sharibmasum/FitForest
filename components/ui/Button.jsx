import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', disabled }) {
  const baseStyle = "w-2/3 self-center rounded-2xl py-4 px-8 shadow-sm";
  const variants = {
    primary: "bg-[#556B2F]",
    secondary: "bg-white border-2 border-gray-300"
  };
  
  const textVariants = {
    primary: "text-white",
    secondary: "text-gray-700"
  };

  return (
    <View className="w-full items-center my-6">
      <TouchableOpacity 
        className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text className={`text-center font-semibold text-lg ${textVariants[variant]}`}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
} 