import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';

export default function AuthLayout({ children, title, showTitle = true }) {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F0FFF0] px-12"
    >
      <View className="flex-1 justify-center items-center">
        <View className="w-full max-w-sm space-y-12">
          {showTitle && (
            <View className="space-y-4">
              <Text className="text-4xl font-bold text-[#556B2F] text-center mb-2">
                FitForest
              </Text>
              <Text className="text-2xl text-gray-600 text-center">
                {title}
              </Text>
            </View>
          )}
          
          <View className="space-y-8">
            {children}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
