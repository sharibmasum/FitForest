import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'warning',
  iconColor = '#EF4444',
  confirmButtonColor = '#556B2F',
  cancelButtonColor = 'gray-200',
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg p-8 w-11/12 max-w-md">
          <View className="items-center mb-6">
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>
          <Text className="text-2xl font-bold text-center text-[#556B2F] mb-4">
            {title}
          </Text>
          <Text className="text-gray-600 text-center text-lg mb-8">
            {message}
          </Text>
          <View className="flex-col">
            <TouchableOpacity
              onPress={onConfirm}
              className={`w-full bg-[${confirmButtonColor}] py-4 px-6 rounded-lg`}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {confirmText}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 16 }} />
            <TouchableOpacity
              onPress={onClose}
              className={`w-full bg-${cancelButtonColor} py-4 px-6 rounded-lg`}
            >
              <Text className="text-gray-700 text-center font-semibold text-lg">
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 