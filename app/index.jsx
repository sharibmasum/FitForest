import { View } from 'react-native';
import { Redirect } from 'expo-router';
import Auth from '../components/auth/Auth';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/TreeHome" />;
  }

  return (
    <View className="flex-1">
      <Auth />
    </View>
  );
} 