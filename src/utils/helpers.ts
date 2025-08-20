import { Ticket, User, Category } from '../types';

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getPriorityColor(priority: string): string {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status: string): string {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    waiting_user: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getPriorityLabel(priority: string): string {
  const labels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica'
  };
  return labels[priority as keyof typeof labels] || priority;
}

export function getStatusLabel(status: string): string {
  const labels = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    waiting_user: 'Aguardando Usuário',
    resolved: 'Resolvido',
    closed: 'Fechado'
  };
  return labels[status as keyof typeof labels] || status;
}

export function calculateSLADeadline(createdAt: string, hours: number): string {
  const created = new Date(createdAt);
  created.setHours(created.getHours() + hours);
  return created.toISOString();
}

export function isSLANearDeadline(slaDeadline: string): boolean {
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursLeft <= 2 && hoursLeft > 0;
}

export function isSLAOverdue(slaDeadline: string): boolean {
  const deadline = new Date(slaDeadline);
  const now = new Date();
  return now > deadline;
}

export function calculateResolutionTime(createdAt: string, resolvedAt?: string): number {
  if (!resolvedAt) return 0;
  
  const created = new Date(createdAt);
  const resolved = new Date(resolvedAt);
  return Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60)); // em horas
}

export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${year}-${random}`;
}