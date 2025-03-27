import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View className="flex-1">
        <Slot />
      </View>
    </AuthProvider>
  );
} 