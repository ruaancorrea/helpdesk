import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Send,
  UserCheck,
  Settings
} from 'lucide-react';
import { Ticket, User as UserType, Category, Timeline } from '../../types';
import { 
  formatDate, 
  getPriorityColor, 
  getStatusColor, 
  getPriorityLabel, 
  getStatusLabel,
  isSLAOverdue,
  isSLANearDeadline 
} from '../../utils/helpers';
import { updateTicket, addTimelineEntry, addInternalComment, getUsers } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

interface TicketDetailProps {
  ticket: Ticket;
  users: UserType[];
  categories: Category[];
  onBack: () => void;
  onUpdate: () => void;
}

export default function TicketDetail({ ticket, users, categories, onBack, onUpdate }: TicketDetailProps) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newInternalComment, setNewInternalComment] = useState('');
  const [workTimer, setWorkTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [newPriority, setNewPriority] = useState(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const ticketUser = users.find(u => u.id === ticket.userId);
  const assignedTechnician = users.find(u => u.id === ticket.assignedTo);
  const category = categories.find(c => c.id === ticket.category);
  const technicians = users.filter(u => u.role === 'technician');

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const canEdit = user?.role === 'admin' || user?.role === 'technician' || user?.id === ticket.userId;
  const canAssign = user?.role === 'admin' || user?.role === 'technician';

  const handleStatusUpdate = async () => {
    if (!canEdit) return;
    
    setIsUpdating(true);
    try {
      await updateTicket(ticket.id, { 
        status: newStatus,
        priority: newPriority,
        assignedTo: assignedTo || undefined,
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : ticket.resolvedAt
      });

      // Add timeline entry for status change
      if (newStatus !== ticket.status) {
        await addTimelineEntry(ticket.id, {
          ticketId: ticket.id,
          userId: user!.id,
          userName: user!.name,
          message: `Status alterado para ${getStatusLabel(newStatus)}`,
          type: 'status_change',
          createdAt: new Date().toISOString()
        });
      }

      // Add timeline entry for assignment
      if (assignedTo !== ticket.assignedTo) {
        const assignedUser = users.find(u => u.id === assignedTo);
        await addTimelineEntry(ticket.id, {
          ticketId: ticket.id,
          userId: user!.id,
          userName: user!.name,
          message: assignedUser ? `Chamado atribuído para ${assignedUser.name}` : 'Chamado desatribuído',
          type: 'assignment',
          createdAt: new Date().toISOString()
        });
      }

      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsUpdating(true);
    try {
      await addTimelineEntry(ticket.id, {
        ticketId: ticket.id,
        userId: user.id,
        userName: user.name,
        message: newComment,
        type: 'comment',
        createdAt: new Date().toISOString()
      });

      setNewComment('');
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddInternalComment = async () => {
    if (!newInternalComment.trim() || !user || user.role === 'user') return;

    setIsUpdating(true);
    try {
      await addInternalComment(ticket.id, {
        ticketId: ticket.id,
        technicianId: user.id,
        technicianName: user.name,
        message: newInternalComment,
        createdAt: new Date().toISOString()
      });

      setNewInternalComment('');
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar comentário interno:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          {canAssign && (
            <div className="flex items-center space-x-2">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock size={16} />
                <span className="font-mono text-sm">{formatTimer(workTimer)}</span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-1 rounded ${
                    isTimerRunning ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Info */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{ticket.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                {getPriorityLabel(ticket.priority)}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-1" />
                {formatDate(ticket.createdAt)}
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Anexos</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Paperclip size={16} />
                      <span className="text-sm">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SLA Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-3">Status SLA</h3>
              <div className="flex items-center space-x-2">
                {isSLAOverdue(ticket.slaDeadline) ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">Vencido</span>
                  </>
                ) : isSLANearDeadline(ticket.slaDeadline) ? (
                  <>
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-600 font-medium">Próximo do Vencimento</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">No Prazo</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Prazo: {formatDate(ticket.slaDeadline)}
              </p>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-3">Solicitante</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {ticketUser?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ticketUser?.name}</p>
                  <p className="text-sm text-gray-500">{ticketUser?.department}</p>
                  <p className="text-sm text-gray-500">{ticketUser?.email}</p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-3">Categoria</h3>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category?.color }}
                />
                <span className="text-gray-900">{category?.name}</span>
              </div>
            </div>

            {/* Assignment */}
            {canAssign && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">Atribuição</h3>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Não atribuído</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Update */}
            {canEdit && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">Atualizar Status</h3>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="waiting_user">Aguardando Usuário</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                  
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Atualizando...' : 'Atualizar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Histórico do Chamado</h2>
        
        <div className="space-y-4">
          {ticket.timeline.map((entry) => (
            <div key={entry.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {entry.type === 'comment' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                  {entry.type === 'status_change' && <Settings className="w-5 h-5 text-blue-600" />}
                  {entry.type === 'assignment' && <UserCheck className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{entry.userName}</span>
                    <span className="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{entry.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Comments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Comentário</h3>
          
          <div className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Digite seu comentário..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isUpdating}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
              <span>Enviar Comentário</span>
            </button>
          </div>
        </div>

        {/* Internal Comments (Technicians only) */}
        {user?.role !== 'user' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentário Interno</h3>
            
            <div className="space-y-4">
              <textarea
                value={newInternalComment}
                onChange={(e) => setNewInternalComment(e.target.value)}
                placeholder="Comentário visível apenas para técnicos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              
              <button
                onClick={handleAddInternalComment}
                disabled={!newInternalComment.trim() || isUpdating}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
                <span>Comentário Interno</span>
              </button>
            </div>

            {/* Show Internal Comments */}
            {ticket.internalComments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Comentários Internos</h4>
                <div className="space-y-3">
                  {ticket.internalComments.map((comment) => (
                    <div key={comment.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-orange-800">{comment.technicianName}</span>
                        <span className="text-sm text-orange-600">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-orange-700">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}