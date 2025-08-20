import React from 'react';
import { Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AppStats } from '../../types';

interface StatsCardsProps {
  stats: AppStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total de Chamados',
      value: stats.totalTickets,
      icon: Ticket,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Em Aberto',
      value: stats.openTickets,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Em Andamento',
      value: stats.inProgressTickets,
      icon: AlertTriangle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Resolvidos',
      value: stats.resolvedTickets,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} mt-1`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}