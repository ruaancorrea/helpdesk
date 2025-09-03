import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  HelpCircle,
  LogOut,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mobileMenuOpen?: boolean;
  closeMobileMenu?: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, mobileMenuOpen, closeMobileMenu }: SidebarProps) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  
  // Usar o estado externo se fornecido, caso contrário usar o estado local
  const isMobileMenuOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : localMobileMenuOpen;
  const toggleMobileMenu = () => {
    if (closeMobileMenu) {
      closeMobileMenu();
    } else {
      setLocalMobileMenuOpen(!localMobileMenuOpen);
    }
  };
  
  // Fechar o menu quando a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        if (closeMobileMenu) {
          closeMobileMenu();
        } else {
          setLocalMobileMenuOpen(false);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileMenu]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Chamados', icon: Ticket },
    ...(user?.role !== 'user' ? [
      { id: 'users', label: 'Usuários', icon: Users },
      { id: 'technicians', label: 'Técnicos', icon: UserCog },
    ] : []),
    ...(user?.role === 'admin' ? [
      { id: 'reports', label: 'Relatórios', icon: BarChart3 },
      { id: 'categories', label: 'Categorias', icon: HelpCircle },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ] : []),
  ];

  return (
    <>
      {/* Botão de menu móvel */}
      <button 
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-navy-900 text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Overlay para fechar o menu quando clicar fora */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-navy-900 text-white flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-navy-700">
          <h1 className="text-xl font-bold">{settings?.general?.companyName || 'HelpDesk Pro'}</h1>
          <p className="text-sm text-navy-300 mt-1">{user?.name}</p>
          <p className="text-xs text-navy-400">{user?.department}</p>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  if (window.innerWidth < 1024) {
                    if (closeMobileMenu) {
                      closeMobileMenu();
                    } else {
                      setLocalMobileMenuOpen(false);
                    }
                  }
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 p-3 text-navy-300 hover:bg-navy-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
