import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import './global.css';

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-4 space-y-4">
      <Text className="text-xl font-bold text-blue-600">Welcome to FitForest with NativeWind!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
