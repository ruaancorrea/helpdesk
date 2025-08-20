import dbData from '../data/db.json';
import { User, Ticket, Category, SLAConfig, Timeline, InternalComment } from '../types';

// Simulação de API com localStorage para persistência
const STORAGE_KEY = 'helpdesk_data';

let data = {
  users: dbData.users as User[],
  tickets: dbData.tickets as Ticket[],
  categories: dbData.categories as Category[],
  slaConfig: dbData.slaConfig as SLAConfig[]
};

// Carrega dados do localStorage se existir
const savedData = localStorage.getItem(STORAGE_KEY);
if (savedData) {
  data = JSON.parse(savedData);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Users API
export async function getUsers(): Promise<User[]> {
  return data.users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  return data.users.find(user => user.id === id);
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString()
  };
  data.users.push(newUser);
  saveData();
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const index = data.users.findIndex(user => user.id === id);
  if (index !== -1) {
    data.users[index] = { ...data.users[index], ...updates };
    saveData();
    return data.users[index];
  }
  return undefined;
}

// Tickets API
export async function getTickets(): Promise<Ticket[]> {
  return data.tickets;
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  return data.tickets.find(ticket => ticket.id === id);
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'internalComments'>): Promise<Ticket> {
  const newTicket: Ticket = {
    ...ticket,
    id: Math.random().toString(36).substring(7),
    timeline: [],
    internalComments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.tickets.push(newTicket);
  saveData();
  return newTicket;
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
  const index = data.tickets.findIndex(ticket => ticket.id === id);
  if (index !== -1) {
    data.tickets[index] = { 
      ...data.tickets[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveData();
    return data.tickets[index];
  }
  return undefined;
}

export async function addTimelineEntry(ticketId: string, entry: Omit<Timeline, 'id'>): Promise<Timeline> {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket não encontrado');

  const newEntry: Timeline = {
    ...entry,
    id: Math.random().toString(36).substring(7)
  };

  ticket.timeline.push(newEntry);
  saveData();
  return newEntry;
}

export async function addInternalComment(ticketId: string, comment: Omit<InternalComment, 'id'>): Promise<InternalComment> {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket não encontrado');

  const newComment: InternalComment = {
    ...comment,
    id: Math.random().toString(36).substring(7)
  };

  ticket.internalComments.push(newComment);
  saveData();
  return newComment;
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  return data.categories.filter(cat => cat.isActive);
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString()
  };
  data.categories.push(newCategory);
  saveData();
  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
  const index = data.categories.findIndex(cat => cat.id === id);
  if (index !== -1) {
    data.categories[index] = { ...data.categories[index], ...updates };
    saveData();
    return data.categories[index];
  }
  return undefined;
}

// SLA Config API
export async function getSLAConfig(): Promise<SLAConfig[]> {
  return data.slaConfig;
}

export async function updateSLAConfig(priority: string, updates: Partial<SLAConfig>): Promise<SLAConfig | undefined> {
  const index = data.slaConfig.findIndex(config => config.priority === priority);
  if (index !== -1) {
    data.slaConfig[index] = { ...data.slaConfig[index], ...updates };
    saveData();
    return data.slaConfig[index];
  }
  return undefined;
}