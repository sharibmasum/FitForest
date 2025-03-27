import { useAuth } from '../context/AuthContext';

export function useToast() {
  const { showToast } = useAuth();

  return {
    showToast,
    showError: (message) => showToast(message, 'error'),
    showSuccess: (message) => showToast(message, 'success'),
  };
} 