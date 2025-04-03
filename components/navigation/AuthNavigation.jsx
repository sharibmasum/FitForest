import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useSlideNavigation } from '../../hooks/useSlideNavigation';
import { useRouter } from 'expo-router';

export function useAuthNavigation() {
  const { navigate, goBack } = useSlideNavigation();
  const router = useRouter();

  const handleNavigation = (screenName) => {
    switch(screenName) {
      case 'welcome':
        router.replace('/Welcome');
        break;
      case 'signin':
        navigate('/SignIn');
        break;
      case 'signup':
        navigate('/SignUp');
        break;
      case 'switch_to_signin':
        goBack();
        setTimeout(() => {
          navigate('/SignIn');
        }, 200);
        break;
      case 'switch_to_signup':
        goBack();
        setTimeout(() => {
          navigate('/SignUp');
        }, 200);
        break;
      default:
        navigate('/Welcome');
    }
  };

  return { navigate: handleNavigation };
}

export function BackToWelcomeButton() {
  const { navigate } = useAuthNavigation();
  return (
    <TouchableOpacity 
      onPress={() => navigate('welcome')}
      className="mt-12 py-3"
    >
      <Text className="text-center text-[#556B2F] text-lg font-medium">
        Back to Welcome
      </Text>
    </TouchableOpacity>
  );
}

export function SwitchToSignInButton() {
  const { navigate } = useAuthNavigation();
  return (
    <TouchableOpacity 
      onPress={() => navigate('switch_to_signin')}
      className="mt-12 py-3"
    >
      <Text className="text-center text-[#556B2F] text-lg font-medium">
        Already have an account? Login
      </Text>
    </TouchableOpacity>
  );
}

export function SwitchToSignUpButton() {
  const { navigate } = useAuthNavigation();
  return (
    <TouchableOpacity 
      onPress={() => navigate('switch_to_signup')}
      className="mt-12 py-3"
    >
      <Text className="text-center text-[#556B2F] text-lg font-medium">
        Don't have an account? Sign up
      </Text>
    </TouchableOpacity>
  );
}

export function AuthNavigationButtons({ showBack = true, showSwitch = true, switchTo = 'signin' }) {
  return (
    <>
      {showBack && <BackToWelcomeButton />}
      {showSwitch && (
        switchTo === 'signin' ? <SwitchToSignInButton /> : <SwitchToSignUpButton />
      )}
    </>
  );
} 