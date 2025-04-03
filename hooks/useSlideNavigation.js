import { useRouter } from 'expo-router';

export function useSlideNavigation() {
  const router = useRouter();

  const navigate = (path) => {
    router.push(path);
  };

  const goBack = (options = {}) => {
    try {
      router.back({ animation: 'slide_from_right' });
    } catch (error) {
      // If there's no screen to go back to, redirect to home
      router.replace('/');
    }
  };

  const replace = (path) => {
    router.replace(path);
  };

  return {
    navigate,
    goBack,
    replace
  };
}