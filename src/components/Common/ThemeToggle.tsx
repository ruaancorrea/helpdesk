import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const toggleDarkMode = () => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        darkMode: !settings.preferences.darkMode
      }
    };
    updateSettings(newSettings);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={settings.preferences.darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {settings.preferences.darkMode ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;