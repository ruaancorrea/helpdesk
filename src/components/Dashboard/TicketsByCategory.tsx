import React from 'react';
import { Ticket, Category } from '../../types';
import { BarChart3 } from 'lucide-react';

interface TicketsByCategoryProps {
  tickets: Ticket[];
  categories: Category[];
}

export default function TicketsByCategory({ tickets, categories }: TicketsByCategoryProps) {
  const categoryData = categories.map(category => {
    const count = tickets.filter(ticket => ticket.category === category.id).length;
    return {
      name: category.name,
      count,
      color: category.color,
      percentage: tickets.length > 0 ? (count / tickets.length) * 100 : 0
    };
  }).filter(cat => cat.count > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Chamados por Categoria</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {categoryData.map((category, index) => (
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
                className="h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ 
                  backgroundColor: category.color,
                  width: `${category.percentage}%`
                }}
              />
            </div>
          </div>
        ))}

        {categoryData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum chamado por categoria</p>
          </div>
        )}
      </div>
    </div>
  );
}