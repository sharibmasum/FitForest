import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from '../../components/ui/Button.jsx';
import TextInput from '../../components/ui/TextInput.jsx';
import { AuthScreenLayout } from './_layout.jsx';
import BackButton from '../../components/ui/BackButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AuthNavigationButtons } from '../../components/navigation/AuthNavigation.jsx';
import { useSlideNavigation } from '../../hooks/useSlideNavigation';
import { useRouter } from 'expo-router';
import Toast from '../../components/ui/Toast';

export default function SignUp() {
  const { signUp, loading } = useAuth();
  const { goBack } = useSlideNavigation();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ 
    username: false, 
    email: false, 
    password: false,
    confirmPassword: false 
  });
  const [errors, setErrors] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [showToast, setShowToast] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      setTouched({ 
        username: true, 
        email: true, 
        password: true,
        confirmPassword: true 
      });
      return;
    }
    const result = await signUp(username, email, password);
    if (result?.success) {
      setShowToast(true);
      setTimeout(() => {
        router.replace('/(auth)/SignIn');
      }, 3000);
    }
  };

  return (
    <>
      <BackButton onPress={goBack} />
      <AuthScreenLayout title="Sign Up" showTitle={true}>
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

        <TextInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
        />

        <Button
          title={loading ? 'Loading...' : 'Sign Up'}
          onPress={handleSignUp}
          disabled={loading}
        />

        <AuthNavigationButtons showBack={false} switchTo="signin" />
      </AuthScreenLayout>

      {showToast && (
        <Toast
          message="Please check your email to confirm your account. Once confirmed, you can sign in."
          type="success"
          onHide={() => setShowToast(false)}
        />
      )}
    </>
  );
} 