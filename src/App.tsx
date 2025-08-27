import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings'; // <-- 1. Importar
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import TicketManagement from './components/Tickets/TicketManagement';
import UserManagement from './components/Users/UserManagement';
import TechnicianManagement from './components/Technicians/TechnicianManagement';
import Reports from './components/Reports/Reports';
import Categories from './components/Categories/Categories';
import Settings from './components/Settings/Settings';
import LoadingSpinner from './components/Common/LoadingSpinner';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    if (user) {
      setActiveSection('dashboard');
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm />;
  }

  const getSectionTitle = () => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard v2 - PROVA DE DEPLOY', // <-- AQUI ESTÁ A ALTERAÇÃO
      tickets: 'Gerenciar Chamados',
      users: 'Usuários',
      technicians: 'Técnicos',
      reports: 'Relatórios',
      categories: 'Categorias',
      settings: 'Configurações',
    };
    return titles[activeSection] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'tickets':
        return <TicketManagement />;
      case 'users':
        return <UserManagement />;
      case 'technicians':
        return <TechnicianManagement />;
      case 'reports':
        return <Reports />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getSectionTitle()} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider> {/* <-- 2. Envolver o AppContent */}
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;