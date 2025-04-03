import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Button from '../../components/ui/Button.jsx';
import TextInput from '../../components/ui/TextInput.jsx';
import { AuthScreenLayout } from './_layout.jsx';
import BackButton from '../../components/ui/BackButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AuthNavigationButtons } from '../../components/navigation/AuthNavigation.jsx';
import { useSlideNavigation } from '../../hooks/useSlideNavigation';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignIn() {
  const { signIn, loading, showToast } = useAuth();
  const { goBack } = useSlideNavigation();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [usernameAttempts, setUsernameAttempts] = useState(0);
  const [isEmailMode, setIsEmailMode] = useState(true);

  const validateForm = () => {
    const newErrors = {};
    if (!username) {
      newErrors.username = isEmailMode ? 'Email is required' : 'Username is required';
    } else if (isEmailMode && !/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = 'Email is invalid';
    }
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkSetupStatus = async (userId) => {
    try {
      // Check if gym location is set
      const { data: profile } = await supabase
        .from('profiles')
        .select('gym_location_set')
        .eq('id', userId)
        .single();

      // Check if workout plan exists
      const { data: workoutPlan, error: workoutError } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('profile_id', userId)
        .limit(1);

      if (workoutError) {
        console.error('Error checking workout plan:', workoutError);
        throw workoutError;
      }

      // If no gym location is set, start with gym location setup
      if (!profile?.gym_location_set) {
        router.replace('/(setup)/SelectGymLocation');
      }
      // If gym location is set but no workout plan exists, go to workout plan setup
      else if (!workoutPlan || workoutPlan.length === 0) {
        router.replace('/(setup)/InitializeWorkoutPlan');
      }
      // If both are set, go to home
      else {
        router.replace('/(tabs)/TreeHome');
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      showToast('Error checking account setup status');
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      setTouched({ username: true, password: true });
      return;
    }

    const result = await signIn(username, password, isEmailMode);
    
    if (result?.error === 'Username not found') {
      const newAttempts = usernameAttempts + 1;
      setUsernameAttempts(newAttempts);
      
      if (newAttempts >= 2) {
        setErrors(prev => ({ ...prev, username: '' }));
      } else {
        showToast('Username not found. Please check your username or try signing in with your email.');
      }
    } else if (result?.success) {
      // Get the current user and check setup status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await checkSetupStatus(user.id);
      }
    }
  };

  const switchToUsername = () => {
    setIsEmailMode(false);
    setUsername('');
    setErrors({});
    setTouched({ username: false, password: false });
  };

  const switchToEmail = () => {
    setIsEmailMode(true);
    setUsername('');
    setErrors({});
    setTouched({ username: false, password: false });
  };

  return (
    <>
      <BackButton onPress={goBack} />
      <AuthScreenLayout title="Sign In" showTitle={true}>
        <TextInput
          label={isEmailMode ? "Email" : "Username"}
          placeholder={isEmailMode ? "Enter your email" : "Enter your username"}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
          }}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.username}
          touched={touched.username}
          onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
          keyboardType={isEmailMode ? "email-address" : "default"}
        />
        
        {isEmailMode && (
          <TouchableOpacity 
            onPress={switchToUsername}
            className="mt-1 mb-4"
          >
            <Text className="text-[#556B2F] text-sm">
              Want to use your username instead?
            </Text>
          </TouchableOpacity>
        )}

        {!isEmailMode && usernameAttempts >= 2 && (
          <TouchableOpacity 
            onPress={switchToEmail}
            className="mt-1 mb-4"
          >
            <Text className="text-[#556B2F] text-sm">
              If you recently created an account, try signing in with your email instead
            </Text>
          </TouchableOpacity>
        )}
        
        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
          touched={touched.password}
          onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
        />

        <Button
          title={loading ? 'Loading...' : 'Sign In'}
          onPress={handleSignIn}
          disabled={loading}
        />

        <AuthNavigationButtons showBack={false} switchTo="signup" />
      </AuthScreenLayout>
    </>
  );
} 