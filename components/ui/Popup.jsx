import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Popup({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'error', // 'error', 'success', 'warning'
  buttonText = 'OK'
}) {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
      default:
        return 'alert-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#22C55E';
      case 'warning':
        return '#F59E0B';
      case 'error':
      default:
        return '#EF4444';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={onClose}
      >
        <Pressable 
          className="bg-white rounded-2xl w-[85%] p-6"
          onPress={e => e.stopPropagation()}
        >
          <View className="items-center mb-4">
            <Ionicons 
              name={getIconName()} 
              size={48} 
              color={getIconColor()} 
            />
          </View>
          
          <Text className="text-xl font-bold text-center mb-2">
            {title}
          </Text>
          
          <Text className="text-gray-600 text-center mb-6">
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="bg-[#556B2F] py-3 px-6 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
} 