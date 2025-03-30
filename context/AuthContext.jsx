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

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // Store username in user metadata for later use
            pendingUsername: username // Store as pending until email confirmation
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

      showToast('Please check your email to confirm your account!', 'success');
      handleNavigation('signin'); // Redirect to sign in page
    } catch (error) {
      console.error('SignUp Error:', error.message);
      showToast(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle email confirmation and profile creation
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if this is a new confirmation
        const user = session?.user;
        if (user?.user_metadata?.pendingUsername) {
          try {
            // Create profile with username
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: user.id,
                  username: user.user_metadata.pendingUsername,
                  email: user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ], {
                onConflict: 'id',
                ignoreDuplicates: false
              });

            if (profileError) {
              console.error('Profile Error:', profileError);
              showToast('Error creating profile. Please contact support.', 'error');
              return;
            }

            // Clear the pendingUsername flag
            await supabase.auth.updateUser({
              data: {
                pendingUsername: null
              }
            });

            showToast('Email confirmed! You can now sign in.', 'success');
          } catch (error) {
            console.error('Profile Creation Error:', error);
            showToast('Error creating profile. Please contact support.', 'error');
          }
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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