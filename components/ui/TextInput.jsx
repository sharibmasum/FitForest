import React from 'react';
import { View, Text, TextInput as RNTextInput } from 'react-native';

export default function TextInput({
  label,
  error,
  touched,
  ...props
}) {
  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="text-gray-700 text-base mb-2 font-medium">
          {label}
        </Text>
      )}
      <RNTextInput
        className={`w-full bg-white border rounded-lg px-4 py-3.5 text-base
          ${error && touched ? 'border-red-500' : 'border-gray-300'}
          ${!error && touched ? 'border-[#556B2F]' : ''}
        `}
        placeholderTextColor="#9CA3AF"
        style={{
          height: 50,
          textAlignVertical: 'center'
        }}
        {...props}
      />
      {error && touched && (
        <Text className="text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
} 