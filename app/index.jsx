import { View, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  console.log('Index: Initial render', {
    isAuthenticated,
    authLoading,
    planLoading,
    gymLocationSet,
    loading
  });

  useEffect(() => {
    console.log('Index: useEffect triggered', { isAuthenticated });
    
    const checkGymLocation = async () => {
      if (isAuthenticated) {
        try {
          console.log('Index: Getting user data');
          const { data: { user } } = await supabase.auth.getUser();
          console.log('Index: User data received', { userId: user?.id });
          
          // If isAuthenticated is true but user is undefined, there's an auth inconsistency
          if (!user) {
            console.log('Index: Auth inconsistency detected - redirecting to Welcome');
            setAuthError(true);
            setLoading(false);
            return;
          }
          
          if (user) {
            // First check if profile exists
            console.log('Index: Checking profile');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('gym_location_set')
              .eq('id', user.id)
              .single();

            console.log('Index: Profile check result', { 
              hasProfile: !!profile, 
              error: profileError?.code,
              gymLocationSet: profile?.gym_location_set 
            });

            if (profileError && profileError.code === 'PGRST116') {
              console.log('Index: Creating new profile');
              // Profile doesn't exist, create it
              const { error: createError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: user.id,
                    email: user.email,
                    username: user.user_metadata?.username || user.email.split('@')[0],
                    gym_location_set: false
                  }
                ]);

              if (createError) {
                console.error('Index: Profile creation error', createError);
                throw createError;
              }
              console.log('Index: Profile created successfully');
              setGymLocationSet(false);
            } else if (profileError) {
              console.error('Index: Profile check error', profileError);
              throw profileError;
            } else {
              console.log('Index: Setting gym location from profile');
              setGymLocationSet(profile?.gym_location_set || false);
            }
          }
        } catch (error) {
          console.error('Index: Error in checkGymLocation', error);
          setGymLocationSet(false);
        } finally {
          console.log('Index: Setting loading to false');
          setLoading(false);
        }
      } else {
        console.log('Index: Not authenticated, setting loading to false');
        setLoading(false);
      }
    };

    checkGymLocation();
  }, [isAuthenticated]);

  console.log('Index: Render state', {
    authLoading,
    loading,
    planLoading,
    gymLocationSet,
    isAuthenticated,
    authError
  });

  // Show loading state
  if (authLoading || loading || (isAuthenticated && !authError && (planLoading || gymLocationSet === null))) {
    console.log('Index: Showing loading screen');
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#556B2F" />
      </View>
    );
  }

  // If there's an auth error, redirect to Welcome
  if (authError) {
    console.log('Index: Redirecting to welcome screen due to auth error');
    return <Redirect href="/Welcome" />;
  }

  if (isAuthenticated) {
    console.log('Index: User is authenticated, checking gym location');
    // If user hasn't set gym location, start setup flow
    if (!gymLocationSet) {
      console.log('Index: Redirecting to gym location setup');
      return <Redirect href="/(setup)/SelectGymLocation" />;
    }
    // If they have set their gym location, go straight to home
    console.log('Index: Redirecting to home');
    return <Redirect href="/(tabs)/TreeHome" />;
  }

  // If not authenticated, redirect to Welcome screen
  console.log('Index: Redirecting to welcome screen');
  return <Redirect href="/Welcome" />;
} 