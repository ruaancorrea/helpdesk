import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getGeneralSettings, saveGeneralSettings, getEmailSettings, saveEmailSettings } from '../utils/api';

// Tipos para as configurações
interface GeneralSettings {
  companyName: string;
  supportEmail: string;
}

interface EmailSettings {
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    notifyOnNew: boolean;
    notifyOnUpdate: boolean;
    notifyOnClose: boolean;
}

interface UserPreferences {
    darkMode: boolean;
    sidebarCollapsed: boolean;
}

// Tipo que agrupa todas as configurações
interface AllSettings {
    general: GeneralSettings;
    email: EmailSettings;
    preferences: UserPreferences;
}

interface SettingsContextType {
  settings: AllSettings | null;
  isLoading: boolean;
  updateSettings: (newSettings: AllSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Configurações padrão caso o banco de dados esteja vazio
const defaultSettings: AllSettings = {
    general: {
        companyName: 'HelpDesk Pro',
        supportEmail: 'suporte@empresa.com',
    },
    email: {
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        notifyOnNew: true,
        notifyOnUpdate: true,
        notifyOnClose: true,
    },
    preferences: {
        darkMode: false,
        sidebarCollapsed: false,
    }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Carregar preferências do localStorage
      let userPreferences = defaultSettings.preferences;
      const savedPreferences = localStorage.getItem('helpdesk_preferences');
      if (savedPreferences) {
        userPreferences = JSON.parse(savedPreferences);
      }
      
      const [generalData, emailData] = await Promise.all([
        getGeneralSettings(),
        getEmailSettings()
      ]);
      
      setSettings({
          general: generalData || defaultSettings.general,
          email: emailData || defaultSettings.email,
          preferences: userPreferences
      });

    } catch (error) {
      console.error('Falha ao carregar configurações, usando padrão.', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (newSettings: AllSettings) => {
    await Promise.all([
        saveGeneralSettings(newSettings.general),
        saveEmailSettings(newSettings.email)
    ]);
    
    // Salvar preferências no localStorage
    localStorage.setItem('helpdesk_preferences', JSON.stringify(newSettings.preferences));
    
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
}
