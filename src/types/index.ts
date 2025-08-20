export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  phone: string;
  role: 'user' | 'technician' | 'admin';
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  category: string;
  userId: string;
  assignedTo?: string;
  attachments: string[];
  timeline: Timeline[];
  internalComments: InternalComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline: string;
}

export interface Timeline {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  type: 'comment' | 'status_change' | 'assignment' | 'priority_change';
  createdAt: string;
}

export interface InternalComment {
  id: string;
  ticketId: string;
  technicianId: string;
  technicianName: string;
  message: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  slaHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface SLAConfig {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responseHours: number;
  resolutionHours: number;
}

export interface AppStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  ticketsByCategory: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByTechnician: Record<string, number>;
}

export interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}