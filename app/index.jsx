import { View } from 'react-native';
import { Redirect } from 'expo-router';
import Auth from '../components/auth/Auth';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from '../hooks/useWorkoutPlan';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { workoutPlan, loading: planLoading } = useWorkoutPlan();
  const [gymLocationSet, setGymLocationSet] = useState(null);

  useEffect(() => {
    const checkGymLocation = async () => {
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('gym_location_set')
            .eq('id', user.id)
            .single();
          
          setGymLocationSet(profile?.gym_location_set || false);
        }
      }
    };

    checkGymLocation();
  }, [isAuthenticated]);

  if (authLoading || (isAuthenticated && (planLoading || gymLocationSet === null))) {
    return null;
  }

  if (isAuthenticated) {
    // If user hasn't set gym location, start setup flow
    if (!gymLocationSet) {
      return <Redirect href="/(setup)/SelectGymLocation" />;
    }
    // If they have set their gym location, go straight to home
    return <Redirect href="/(tabs)/TreeHome" />;
  }

  return (
    <View className="flex-1">
      <Auth />
    </View>
  );
} 