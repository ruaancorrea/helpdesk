import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../Common/ThemeToggle';
import { useSettings } from '../../hooks/useSettings';

interface HeaderProps {
  title: string;
  toggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, toggleMobileMenu }) => {
  const { user } = useAuth();
  const { settings } = useSettings();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center">
        {toggleMobileMenu && (
          <button 
            onClick={toggleMobileMenu} 
            className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={24} />
          </button>
        )}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white ml-2 lg:ml-0">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar chamados..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <ThemeToggle />
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}