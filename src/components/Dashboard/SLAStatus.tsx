import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Ticket } from '../../types';
import { isSLAOverdue, isSLANearDeadline } from '../../utils/helpers';

interface SLAStatusProps {
  tickets: Ticket[];
}

export default function SLAStatus({ tickets }: SLAStatusProps) {
  const activeTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
  
  const overdueSLA = activeTickets.filter(ticket => isSLAOverdue(ticket.slaDeadline)).length;
  const nearDeadline = activeTickets.filter(ticket => isSLANearDeadline(ticket.slaDeadline)).length;
  const onTime = activeTickets.length - overdueSLA - nearDeadline;

  const slaData = [
    {
      label: 'Vencidos',
      count: overdueSLA,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Próximo do Vencimento',
      count: nearDeadline,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'No Prazo',
      count: onTime,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Status SLA</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {slaData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${item.bgColor} ${item.borderColor}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <span className={`text-lg font-bold ${item.color}`}>
                {item.count}
              </span>
            </div>
          );
        })}
      </div>

      {activeTickets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum chamado ativo</p>
        </div>
      )}
    </div>
  );
}