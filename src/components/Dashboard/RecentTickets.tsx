import React from 'react';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Ticket, User as UserType } from '../../types';
import { formatDateShort, getPriorityColor, getStatusColor, getPriorityLabel, getStatusLabel } from '../../utils/helpers';

interface RecentTicketsProps {
  tickets: Ticket[];
  users: UserType[];
  onTicketClick: (ticketId: string) => void;
}

export default function RecentTickets({ tickets, users, onTicketClick }: RecentTicketsProps) {
  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Usuário não encontrado';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Chamados Recentes</h3>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {recentTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onTicketClick(ticket.id)}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{ticket.title}</h4>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  {getUserName(ticket.userId)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDateShort(ticket.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                {getPriorityLabel(ticket.priority)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>
        ))}

        {recentTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum chamado encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}