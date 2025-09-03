import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings';
import { ToastProvider } from './hooks/useToast';
import ThemeProvider from './components/Common/ThemeProvider';
import Toast from './components/Common/Toast';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import LoadingSpinner from './components/Common/LoadingSpinner';

const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));
const TicketManagement = React.lazy(() => import('./components/Tickets/TicketManagement'));
const UserManagement = React.lazy(() => import('./components/Users/UserManagement'));
const TechnicianManagement = React.lazy(() => import('./components/Technicians/TechnicianManagement'));
const Reports = React.lazy(() => import('./components/Reports/Reports'));
const Categories = React.lazy(() => import('./components/Categories/Categories'));
const Settings = React.lazy(() => import('./components/Settings/Settings'));

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      dashboard: 'Dashboard',
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
                  return <Dashboard setActiveSection={setActiveSection} />;
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => {
          setActiveSection(section);
          setIsMobileMenuOpen(false);
        }}
        mobileMenuOpen={isMobileMenuOpen}
        closeMobileMenu={toggleMobileMenu}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getSectionTitle()} toggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Suspense fallback={<LoadingSpinner />}>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

// Configuração dos providers

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <ThemeProvider>
            <AppContent />
            <Toast />
          </ThemeProvider>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;