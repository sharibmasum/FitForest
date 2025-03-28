import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from '../../components/ui/Button.jsx';
import TextInput from '../../components/ui/TextInput.jsx';
import AuthLayout from './_layout.jsx';
import BackButton from '../../components/ui/BackButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SignUp() {
  const { signUp, loading, handleNavigation } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, email: false, password: false });
  const [errors, setErrors] = useState({ username: '', email: '', password: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      setTouched({ username: true, email: true, password: true });
      return;
    }
    await signUp(username, email, password);
  };

  return (
    <>
      <BackButton onPress={() => handleNavigation('welcome')} />
      <AuthLayout title="Sign Up" showTitle={true}>
        <TextInput
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.username}
          touched={touched.username}
          onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
        />

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
          title={loading ? 'Loading...' : 'Sign Up'}
          onPress={handleSignUp}
          disabled={loading}
        />

        <TouchableOpacity 
          onPress={() => handleNavigation('signin')}
          className="mt-12 py-3"
        >
          <Text className="text-center text-[#556B2F] text-lg font-medium">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </AuthLayout>
    </>
  );
} 