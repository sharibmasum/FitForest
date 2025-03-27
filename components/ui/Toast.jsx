import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Toast({ message, type = 'error', onHide }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      hideToast();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide();
    });
  };

  const toastPosition = insets.top + 10;

  return (
    <Animated.View 
      style={{
        position: 'absolute',
        top: toastPosition,
        left: 16,
        right: 16,
        opacity: fadeAnim,
        transform: [{ translateY }],
        zIndex: 9999,
      }}
    >
      <View className="bg-white rounded-lg shadow-xl overflow-hidden">
        <View className={`flex-row items-center p-4 ${
          type === 'error' ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <Ionicons 
            name={type === 'error' ? 'alert-circle' : 'checkmark-circle'} 
            size={24} 
            color={type === 'error' ? '#EF4444' : '#10B981'}
          />
          <Text className={`flex-1 ml-3 font-medium ${
            type === 'error' ? 'text-red-700' : 'text-green-700'
          }`}>
            {message}
          </Text>
          <TouchableOpacity onPress={hideToast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
} 