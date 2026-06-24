import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const useDarkMode = () => {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('erp-theme', isDark ? 'dark' : 'light');
  };

  const isDark = () => document.documentElement.classList.contains('dark');

  useEffect(() => {
    const saved = localStorage.getItem('erp-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return { toggleTheme, isDark };
};

export default useDarkMode;
