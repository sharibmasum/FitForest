import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WorkoutVerification from '../WorkoutVerification';

export default function WorkoutVerificationModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <View className="bg-gray-100 rounded-t-3xl h-[55%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-[#556B2F]">Workout Status</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#556B2F" />
              </TouchableOpacity>
            </View>
            <WorkoutVerification />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
} 