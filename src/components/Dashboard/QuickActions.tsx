import { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import NewTicketForm from '../Tickets/NewTicketForm';
import { useAuth } from '../../hooks/useAuth';
import { getCategories } from '../../utils/api';
import { Category } from '../../types';

export default function QuickActions() {
  const { user } = useAuth();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleNewTicket = async () => {
    const categoriesData = await getCategories();
    setCategories(categoriesData as Category[]);
    setShowNewTicket(true);
  };

  const handleSearch = () => {
    // Implementar lógica de busca
    console.log('Buscar chamados');
  };

  const handleFilters = () => {
    // Implementar lógica de filtros
    console.log('Abrir filtros');
  };

  const handleExport = () => {
    // Implementar lógica de exportação
    console.log('Exportar dados');
  };

  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={handleSearch}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Search size={18} />
        <span className="hidden sm:block">Buscar</span>
      </button>

      <button 
        onClick={handleFilters}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={18} />
        <span className="hidden sm:block">Filtros</span>
      </button>

      {(user?.role === 'admin' || user?.role === 'technician') && (
        <button 
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={18} />
          <span className="hidden sm:block">Exportar</span>
        </button>
      )}

      <button
        onClick={handleNewTicket}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={18} />
        <span>Novo Chamado</span>
      </button>

      {showNewTicket && (
        <NewTicketForm
          categories={categories}
          onClose={() => setShowNewTicket(false)}
          onSuccess={() => {
            setShowNewTicket(false);
            window.location.reload(); // Refresh to show new ticket
          }}
        />
      )}
    </div>
  );
}