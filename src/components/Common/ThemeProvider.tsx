import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    
    // Aplicar ou remover a classe 'dark' do elemento html
    if (settings.preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  return <>{children}</>;
};

export default ThemeProvider;