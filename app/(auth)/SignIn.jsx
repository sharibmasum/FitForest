import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Button from '../../components/ui/Button.jsx';
import TextInput from '../../components/ui/TextInput.jsx';
import AuthLayout from './_layout.jsx';
import BackButton from '../../components/ui/BackButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SignIn() {
  const { signIn, loading, handleNavigation } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [usernameAttempts, setUsernameAttempts] = useState(0);
  const [showEmailSuggestion, setShowEmailSuggestion] = useState(false);
  const [isEmailMode, setIsEmailMode] = useState(false);

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

  const handleSignIn = async () => {
    if (!validateForm()) {
      setTouched({ username: true, password: true });
      return;
    }

    const result = await signIn(username, password, isEmailMode);
    
    if (result?.error === 'Username not found') {
      const newAttempts = usernameAttempts + 1;
      setUsernameAttempts(newAttempts);
      
      if (newAttempts === 1) {
        setShowEmailSuggestion(true);
      } else if (newAttempts >= 2) {
        setShowEmailSuggestion(true);
        setErrors(prev => ({
          ...prev,
          username: 'If you recently created an account, try signing in with your email instead'
        }));
      }
    }
  };

  const switchToEmail = () => {
    setIsEmailMode(true);
    setUsername('');
    setShowEmailSuggestion(false);
    setErrors({});
    setTouched({ username: false, password: false });
  };

  return (
    <>
      <BackButton onPress={() => handleNavigation('welcome')} />
      <AuthLayout title="Sign In" showTitle={true}>
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
        
        {showEmailSuggestion && !isEmailMode && (
          <TouchableOpacity 
            onPress={switchToEmail}
            className="mt-1 mb-4"
          >
            <Text className="text-[#556B2F] text-sm">
              Try signing in with your email instead?
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

        <TouchableOpacity 
          onPress={() => handleNavigation('signup')}
          className="mt-12 py-3"
        >
          <Text className="text-center text-[#556B2F] text-lg font-medium">
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </AuthLayout>
    </>
  );
} 