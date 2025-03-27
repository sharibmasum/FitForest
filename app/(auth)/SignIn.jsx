import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from '../../components/ui/Button.jsx';
import TextInput from '../../components/ui/TextInput.jsx';
import AuthLayout from './_layout.jsx';
import BackButton from '../../components/ui/BackButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SignIn() {
  const { signIn, authLoading, handleNavigation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      setTouched({ email: true, password: true });
      return;
    }
    await signIn(email, password);
  };

  return (
    <>
      <BackButton onPress={() => handleNavigation('welcome')} />
      <AuthLayout title="Login" showTitle={true}>
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
          touched={touched.email}
          onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
          editable={!authLoading}
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
          editable={!authLoading}
        />

        <Button
          title={authLoading ? 'Logging in...' : 'Login'}
          onPress={handleSignIn}
          disabled={authLoading}
        />

        <TouchableOpacity 
          onPress={() => handleNavigation('signup')}
          className="mt-12 py-3"
          disabled={authLoading}
        >
          <Text className="text-center text-[#556B2F] text-lg font-medium">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </AuthLayout>
    </>
  );
} 