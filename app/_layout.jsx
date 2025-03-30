import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <View className="flex-1">
          <Slot />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
} 