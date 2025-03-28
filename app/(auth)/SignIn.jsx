import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
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

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      setTouched({ username: true, password: true });
      return;
    }
    await signIn(username, password);
  };

  return (
    <>
      <BackButton onPress={() => handleNavigation('welcome')} />
      <AuthLayout title="Sign In" showTitle={true}>
        <TextInput
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.username}
          touched={touched.username}
          onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
        />
        
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