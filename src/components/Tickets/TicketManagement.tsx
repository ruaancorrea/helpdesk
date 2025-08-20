import React, { useState, useEffect } from 'react';
import { getTickets, getUsers, getCategories } from '../../utils/api';
import { Ticket, User, Category } from '../../types';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import NewTicketForm from './NewTicketForm';
import { useAuth } from '../../hooks/useAuth';

export default function TicketManagement() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleNewTicketSuccess = () => {
    loadData();
    setShowNewTicket(false);
  };

  const handleTicketUpdate = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter tickets based on user role
  const filteredTickets = user?.role === 'user' 
    ? tickets.filter(t => t.userId === user.id)
    : user?.role === 'technician' 
      ? tickets.filter(t => t.assignedTo === user.id || !t.assignedTo)
      : tickets;

  if (selectedTicketId) {
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (ticket) {
      return (
        <TicketDetail
          ticket={ticket}
          users={users}
          categories={categories}
          onBack={() => setSelectedTicketId(null)}
          onUpdate={handleTicketUpdate}
        />
      );
    }
  }

  return (
    <div>
      <TicketList
        tickets={filteredTickets}
        users={users}
        categories={categories}
        onTicketClick={handleTicketClick}
        onNewTicket={() => setShowNewTicket(true)}
      />

      {showNewTicket && (
        <NewTicketForm
          categories={categories}
          onClose={() => setShowNewTicket(false)}
          onSuccess={handleNewTicketSuccess}
        />
      )}
    </div>
  );
}