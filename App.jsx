import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import './global.css';
import { ExpoRoot } from 'expo-router';

export default function App() {
  return (
    <View className="flex-1">
      <ExpoRoot context={require.context('./app')} />
      <StatusBar style="auto" />
    </View>
  );
}
