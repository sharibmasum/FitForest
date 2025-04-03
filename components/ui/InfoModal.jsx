import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InfoModal({
  visible,
  onClose,
  title,
  content,
  iconColor = '#556B2F',
  textColor = '#556B2F',
  contentColor = '#4B5563'
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white mx-4 p-6 rounded-xl shadow-lg">
          <View className="flex-row justify-between items-start mb-4">
            <Text className={`text-xl font-semibold flex-1 mr-4 ${textColor}`}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
          <Text className={`leading-6 ${contentColor}`}>
            {content}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
} 