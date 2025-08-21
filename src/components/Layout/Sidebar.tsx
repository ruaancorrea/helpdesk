import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  HelpCircle,
  LogOut,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

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
    <div className="w-64 bg-navy-900 text-white flex flex-col h-full">
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
              onClick={() => onSectionChange(item.id)}
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
  );
}
