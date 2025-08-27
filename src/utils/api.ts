import { User, Ticket, Category, SLAConfig, Timeline, InternalComment } from '../types';

export const API_URL = 'https://helpdesk-backend-cni6.onrender.com';

// --- ROTAS DE USUÁRIOS ---

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Falha ao buscar usuários');
  return response.json();
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(user => user.id === id);
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Falha ao criar usuário');
  return response.json();
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Falha ao atualizar usuário');
  return response.json();
}

// --- ROTAS DE TICKETS ---

export async function getTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/tickets`);
  if (!response.ok) throw new Error('Falha ao buscar tickets');
  return response.json();
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  const tickets = await getTickets();
  return tickets.find(ticket => ticket.id === id);
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'internalComments'>): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  if (!response.ok) throw new Error('Falha ao criar ticket');
  return response.json();
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Falha ao atualizar ticket');
    return response.json();
}

export async function addTimelineEntry(ticketId: string, entry: Omit<Timeline, 'id' | 'createdAt'>): Promise<Timeline> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/timeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error('Falha ao adicionar entrada na timeline');
  return response.json();
}

export async function addInternalComment(ticketId: string, comment: Omit<InternalComment, 'id' | 'createdAt'>): Promise<InternalComment> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/internal-comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  if (!response.ok) throw new Error('Falha ao adicionar comentário interno');
  return response.json();
}

// --- ROTAS DE CATEGORIAS ---

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Falha ao buscar categorias');
  return response.json();
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error('Falha ao criar categoria');
  return response.json();
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Falha ao atualizar categoria');
  return response.json();
}

// --- ROTAS DE SLA ---

export async function getSLAConfig(): Promise<SLAConfig[]> {
  const response = await fetch(`${API_URL}/sla-config`);
  if (!response.ok) throw new Error('Falha ao buscar config de SLA');
  return response.json();
}

export async function updateSLAConfig(id: string, updates: Partial<SLAConfig>): Promise<SLAConfig | undefined> {
  const response = await fetch(`${API_URL}/sla-config/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Falha ao atualizar config de SLA');
  return response.json();
}

// --- ROTAS DE CONFIGURAÇÕES ---

export async function getGeneralSettings() {
    const response = await fetch(`${API_URL}/settings/general`);
    if (!response.ok) return null;
    return response.json();
}

export async function saveGeneralSettings(settings: any) {
    const response = await fetch(`${API_URL}/settings/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Falha ao salvar configurações gerais');
    return response.json();
}

export async function getEmailSettings() {
    const response = await fetch(`${API_URL}/settings/email`);
    if (!response.ok) return null;
    return response.json();
}

export async function saveEmailSettings(settings: any) {
    const response = await fetch(`${API_URL}/settings/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Falha ao salvar configurações de e-mail');
    return response.json();
}