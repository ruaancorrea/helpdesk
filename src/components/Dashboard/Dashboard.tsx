import React, { useState, useEffect } from 'react';
import { getTickets, getUsers, getCategories } from '../../utils/api';
import { Ticket, User, Category, AppStats } from '../../types';
import StatsCards from './StatsCards';
import RecentTickets from './RecentTickets';
import TicketsByCategory from './TicketsByCategory';
import SLAStatus from './SLAStatus';
import QuickActions from './QuickActions';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

      // Calculate stats
      const totalTickets = ticketsData.length;
      const openTickets = ticketsData.filter(t => t.status === 'open').length;
      const inProgressTickets = ticketsData.filter(t => t.status === 'in_progress').length;
      const resolvedTickets = ticketsData.filter(t => t.status === 'resolved').length;
      const closedTickets = ticketsData.filter(t => t.status === 'closed').length;

      // Calculate average resolution time
      const resolvedTicketsWithTime = ticketsData.filter(t => t.resolvedAt);
      const avgResolutionTime = resolvedTicketsWithTime.length > 0 
        ? resolvedTicketsWithTime.reduce((acc, ticket) => {
            const created = new Date(ticket.createdAt);
            const resolved = new Date(ticket.resolvedAt!);
            return acc + (resolved.getTime() - created.getTime());
          }, 0) / resolvedTicketsWithTime.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Tickets by category
      const ticketsByCategory: Record<string, number> = {};
      categoriesData.forEach(cat => {
        ticketsByCategory[cat.name] = ticketsData.filter(t => t.category === cat.id).length;
      });

      // Tickets by priority
      const ticketsByPriority: Record<string, number> = {
        low: ticketsData.filter(t => t.priority === 'low').length,
        medium: ticketsData.filter(t => t.priority === 'medium').length,
        high: ticketsData.filter(t => t.priority === 'high').length,
        critical: ticketsData.filter(t => t.priority === 'critical').length,
      };

      // Tickets by technician
      const ticketsByTechnician: Record<string, number> = {};
      usersData.filter(u => u.role === 'technician').forEach(tech => {
        ticketsByTechnician[tech.name] = ticketsData.filter(t => t.assignedTo === tech.id).length;
      });

      setStats({
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        averageResolutionTime: Math.round(avgResolutionTime),
        ticketsByCategory,
        ticketsByPriority,
        ticketsByTechnician,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter tickets based on user role
  const userTickets = user?.role === 'user' 
    ? tickets.filter(t => t.userId === user.id)
    : tickets;

  const assignedTickets = user?.role === 'technician'
    ? tickets.filter(t => t.assignedTo === user.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' && 'Painel Administrativo'}
            {user?.role === 'technician' && 'Painel do Técnico'}
            {user?.role === 'user' && 'Seus Chamados'}
          </p>
        </div>
        <QuickActions />
      </div>

      <StatsCards 
        stats={user?.role === 'user' ? {
          ...stats,
          totalTickets: userTickets.length,
          openTickets: userTickets.filter(t => t.status === 'open').length,
          inProgressTickets: userTickets.filter(t => t.status === 'in_progress').length,
          resolvedTickets: userTickets.filter(t => t.status === 'resolved').length,
        } : stats} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTickets 
            tickets={
              user?.role === 'technician' ? assignedTickets :
              user?.role === 'user' ? userTickets : 
              tickets
            }
            users={users}
            onTicketClick={() => {}} // Will be implemented with navigation
          />
        </div>
        
        <div className="space-y-6">
          <TicketsByCategory 
            tickets={userTickets}
            categories={categories}
          />
          
          <SLAStatus 
            tickets={
              user?.role === 'technician' ? assignedTickets :
              user?.role === 'user' ? userTickets : 
              tickets
            }
          />
        </div>
      </div>
    </div>
  );
}