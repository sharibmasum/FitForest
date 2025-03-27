import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const { signOut } = useAuth();

  const settingsOptions = [
    {
      title: 'Account',
      icon: 'person-circle',
      items: [
        { label: 'Edit Profile', icon: 'create-outline' },
        { label: 'Notifications', icon: 'notifications-outline' },
        { label: 'Privacy', icon: 'lock-closed-outline' },
      ]
    },
    {
      title: 'App',
      icon: 'settings',
      items: [
        { label: 'Language', icon: 'language-outline' },
        { label: 'Help & Support', icon: 'help-circle-outline' },
        { label: 'About', icon: 'information-circle-outline' },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-3xl font-bold text-[#556B2F] mb-6">
          Settings
        </Text>

        {settingsOptions.map((section, index) => (
          <View key={section.title} className={index > 0 ? 'mt-6' : ''}>
            <Text className="text-lg font-semibold mb-3 text-gray-700">
              {section.title}
            </Text>
            <View className="bg-gray-50 rounded-lg overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center p-4 ${
                    itemIndex < section.items.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <Ionicons name={item.icon} size={24} color="#556B2F" />
                  <Text className="ml-3 text-base">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={signOut}
          className="mt-6 bg-red-500 p-4 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 