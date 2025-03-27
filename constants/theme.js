export const COLORS = {
  primary: '#556B2F',
  background: '#F0FFF0',
  white: '#FFFFFF',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  gray: {
    50: '#F9FAFB',
    200: '#E5E7EB',
    300: '#D1D5DB',
    600: '#4B5563',
    700: '#374151',
  },
};

export const TIMING = {
  toastDuration: 3000,
  toastFadeIn: 200,
  toastFadeOut: 150,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const UI_TEXT = {
  auth: {
    welcome: {
      title: 'FitForest',
      subtitle: 'Grow your goals, one gym trip at a time.',
      getStarted: 'Get Started',
      haveAccount: 'I already have an account',
    },
    signIn: {
      title: 'Sign In',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      submitButton: 'Sign In',
      noAccount: 'Don\'t have an account? Sign up',
    },
    signUp: {
      title: 'Sign Up',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      submitButton: 'Sign Up',
      haveAccount: 'Already have an account? Login',
    },
    validation: {
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 6 characters',
    },
  },
  toast: {
    success: {
      login: 'Successfully logged in!',
      signup: 'Check your email for the confirmation link!',
      signout: 'Successfully signed out',
    },
    error: {
      session: 'Error checking session: ',
    },
  },
}; 