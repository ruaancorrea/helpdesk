import { useState, useEffect } from 'react';
import { Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTickets, getUsers, getCategories } from '../../utils/api';
import { Ticket, User, Category } from '../../types';
import { formatDate, calculateResolutionTime, getStatusLabel, getPriorityLabel } from '../../utils/helpers';

export default function Reports() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dateRange, setDateRange] = useState({
    start: '', // Será definido dinamicamente
    end: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [ticketsData, usersData, categoriesData] = await Promise.all([
          getTickets(),
          getUsers(),
          getCategories()
        ]);

        setTickets(ticketsData);
        setUsers(usersData);
        setCategories(categoriesData);

        if (ticketsData.length > 0) {
          const oldestTicket = ticketsData.reduce((oldest, current) => {
            return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
          });
          setDateRange(prev => ({
            ...prev,
            start: new Date(oldestTicket.createdAt).toISOString().split('T')[0]
          }));
        } else {
            setDateRange(prev => ({
                ...prev,
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }));
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (!dateRange.start) return false;

    const ticketDate = new Date(ticket.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    return ticketDate >= startDate && ticketDate <= endDate;
  });

  const generateStats = () => {
    const totalTickets = filteredTickets.length;
    const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved').length;
    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

    const resolvedTicketsWithTime = filteredTickets.filter(t => t.resolvedAt);
    const avgResolutionTime = resolvedTicketsWithTime.length > 0
      ? resolvedTicketsWithTime.reduce((acc, ticket) => {
          return acc + calculateResolutionTime(ticket.createdAt, ticket.resolvedAt);
        }, 0) / resolvedTicketsWithTime.length
      : 0;

    const ticketsByCategory = categories.map(category => ({
      name: category.name,
      count: filteredTickets.filter(t => t.category === category.id).length,
      color: category.color
    }));

    const ticketsByPriority = [
      { name: 'Baixa', count: filteredTickets.filter(t => t.priority === 'low').length, color: '#10b981' },
      { name: 'Média', count: filteredTickets.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
      { name: 'Alta', count: filteredTickets.filter(t => t.priority === 'high').length, color: '#f97316' },
      { name: 'Crítica', count: filteredTickets.filter(t => t.priority === 'critical').length, color: '#ef4444' },
    ];

    const technicians = users.filter(u => u.role === 'technician');
    const ticketsByTechnician = technicians.map(tech => ({
      name: tech.name,
      count: filteredTickets.filter(t => t.assignedTo === tech.id).length
    }));

    const ticketsByStatus = [
      { name: 'Aberto', count: filteredTickets.filter(t => t.status === 'open').length, color: '#3b82f6' },
      { name: 'Em Andamento', count: filteredTickets.filter(t => t.status === 'in_progress').length, color: '#8b5cf6' },
      { name: 'Aguardando', count: filteredTickets.filter(t => t.status === 'waiting_user').length, color: '#f59e0b' },
      { name: 'Resolvido', count: filteredTickets.filter(t => t.status === 'resolved').length, color: '#10b981' },
      { name: 'Fechado', count: filteredTickets.filter(t => t.status === 'closed').length, color: '#6b7280' },
    ];

    return {
      totalTickets,
      resolvedTickets,
      resolutionRate,
      avgResolutionTime,
      ticketsByCategory,
      ticketsByPriority,
      ticketsByTechnician,
      ticketsByStatus
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text('Relatório de Chamados', 14, 16);
    doc.setFontSize(10);
    doc.text(`Período: ${formatDate(dateRange.start + 'T00:00:00Z')} - ${formatDate(dateRange.end + 'T23:59:59Z')}`, 14, 22);

    const tableData = filteredTickets.map(ticket => {
        const user = users.find(u => u.id === ticket.userId);
        const category = categories.find(c => c.id === ticket.category);
        return [
          ticket.id,
          ticket.title,
          getStatusLabel(ticket.status),
          getPriorityLabel(ticket.priority),
          category?.name || '',
          user?.name || '',
          formatDate(ticket.createdAt)
        ];
    });

    autoTable(doc, {
        startY: 30,
        head: [['ID', 'Título', 'Status', 'Prioridade', 'Categoria', 'Usuário', 'Criado em']],
        body: tableData,
    });
    
    doc.save(`relatorio_chamados_${dateRange.start}_${dateRange.end}.pdf`);
  };

  const exportToExcel = () => {
    const csvContent = [
      ['ID', 'Título', 'Status', 'Prioridade', 'Categoria', 'Usuário', 'Criado em', 'Resolvido em'].join(','),
      ...filteredTickets.map(ticket => {
        const user = users.find(u => u.id === ticket.userId);
        const category = categories.find(c => c.id === ticket.category);
        
        return [
          `"${ticket.id}"`,
          `"${ticket.title.replace(/"/g, '""')}"`,
          getStatusLabel(ticket.status),
          getPriorityLabel(ticket.priority),
          `"${category?.name || ''}"`,
          `"${user?.name || ''}"`,
          formatDate(ticket.createdAt),
          ticket.resolvedAt ? formatDate(ticket.resolvedAt) : ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_chamados_${dateRange.start}_${dateRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !dateRange.start) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = generateStats();

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Calendar className="w-6 h-6 text-gray-400" />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">De:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Até:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download size={18} />
              <span>PDF</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Chamados</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalTickets}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolutionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio de Resolução</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.avgResolutionTime.toFixed(1)}h</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolvidos</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.resolvedTickets}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Chamados por Categoria</h3>
          <div className="space-y-4">
            {stats.ticketsByCategory.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {category.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: category.color,
                      width: `${stats.totalTickets > 0 ? (category.count / stats.totalTickets) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Chamados por Status</h3>
          <div className="space-y-4">
            {stats.ticketsByStatus.filter(s => s.count > 0).map((status, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {status.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {status.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: status.color,
                      width: `${stats.totalTickets > 0 ? (status.count / stats.totalTickets) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Chamados por Prioridade</h3>
          <div className="space-y-4">
            {stats.ticketsByPriority.filter(p => p.count > 0).map((priority, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {priority.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {priority.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: priority.color,
                      width: `${stats.totalTickets > 0 ? (priority.count / stats.totalTickets) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Technician */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Chamados por Técnico</h3>
          <div className="space-y-4">
            {stats.ticketsByTechnician.filter(t => t.count > 0).map((technician, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {technician.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {technician.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${stats.totalTickets > 0 ? (technician.count / stats.totalTickets) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}