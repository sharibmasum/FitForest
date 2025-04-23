import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Toast from '../components/ui/Toast';
import { useRouter } from 'expo-router';
import { useSlideNavigation } from '../hooks/useSlideNavigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();
  const { navigate } = useSlideNavigation();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      showToast('Error checking session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (usernameOrEmail, password, isEmailMode = false) => {
    if (authLoading) return;
    
    try {
      setAuthLoading(true);
      
      let email = usernameOrEmail;
      
      // If not in email mode, look up the email by username
      if (!isEmailMode) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', usernameOrEmail)
          .maybeSingle();

        if (userError) {
          console.error('User lookup error:', userError);
          throw new Error('Error looking up username');
        }

        if (!userData) {
          return { error: 'Username not found' };
        }

        email = userData.email;
      }

      // Sign in with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message === 'Email not confirmed') {
          throw new Error('Please confirm your email before signing in. Check your inbox for the confirmation link.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error(isEmailMode ? 'Invalid email or password' : 'Invalid password');
        }
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      showToast('Successfully logged in!', 'success');
      return { success: true };
    } catch (error) {
      console.error('SignIn Error:', error.message);
      showToast(error.message);
      return { error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (username, email, password) => {
    if (authLoading) return;

    try {
      setAuthLoading(true);
      
      // First, check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      // Check if email is already registered
      const { data: existingEmail, error: emailError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('An account with this email already exists');
      }

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            pendingUsername: username
          }
        }
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      return { success: true };
    } catch (error) {
      console.error('SignUp Error:', error.message);
      showToast(error.message);
      return { error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    if (authLoading) return;

    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Update the auth state first
      setSession(null);
      setUser(null);
      
      // Then navigate to the Welcome screen directly
      router.replace('/Welcome');
      
      showToast('Successfully signed out', 'success');
    } catch (error) {
      showToast(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        session,
        loading,
        authLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!session,
        showToast,
      }}
    >
      {children}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 