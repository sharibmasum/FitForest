import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', disabled, className = '' }) {
  const baseStyle = "w-4/5 self-center rounded-2xl py-4 px-8 shadow-sm";
  const variants = {
    primary: "bg-[#556B2F]",
    secondary: "bg-white border-2 border-gray-300"
  };
  
  const textVariants = {
    primary: "text-white",
    secondary: "text-gray-700"
  };

  return (
    <TouchableOpacity 
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`text-center font-semibold text-lg ${textVariants[variant]}`} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
} 