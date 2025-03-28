import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Toast from '../components/ui/Toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [screen, setScreen] = useState('welcome');
  const [toast, setToast] = useState(null);

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

  const handleNavigation = useCallback((screenName) => {
    setScreen(screenName);
  }, []);

  const signIn = async (username, password) => {
    if (authLoading) return;
    
    try {
      setAuthLoading(true);
      
      // First, get the email associated with the username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .maybeSingle();

      if (userError) {
        console.error('User lookup error:', userError);
        throw new Error('Error looking up username');
      }

      if (!userData) {
        throw new Error('Username not found');
      }

      console.log('Found user profile for:', username);

      // Then sign in with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw new Error('Invalid password');
      }

      setSession(data.session);
      setUser(data.user);
      showToast('Successfully logged in!', 'success');
    } catch (error) {
      console.error('SignIn Error:', error.message);
      showToast(error.message);
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

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Store username in user metadata
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

      console.log('Created auth user:', authData.user.id);

      // Create profile with username
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: authData.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Profile Error:', profileError);
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw new Error('Failed to create profile. Please try again.');
      }

      console.log('Created profile for user:', username);
      showToast('Check your email for the confirmation link!', 'success');
    } catch (error) {
      console.error('SignUp Error:', error.message);
      showToast(error.message);
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
      
      setSession(null);
      setUser(null);
      setScreen('welcome');
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
        screen,
        signIn,
        signUp,
        signOut,
        handleNavigation,
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