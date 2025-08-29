import React, { useState } from 'react';
import { X, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { Category } from '../../types';
import { createTicket } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { calculateSLADeadline } from '../../utils/helpers';
import { API_URL } from '../../utils/api';

interface NewTicketFormProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

interface Attachment {
  name: string;
  url: string;
}

export default function NewTicketForm({ categories, onClose, onSuccess }: NewTicketFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category) return;

    setIsLoading(true);
    setError('');

    try {
      const category = categories.find(c => c.id === formData.category);
      const slaHours = category?.slaHours || 24;

      await createTicket({
        ...formData,
        userId: user.id,
        status: 'open',
        attachments: attachments.map(att => JSON.stringify(att)),
        slaDeadline: calculateSLADeadline(new Date().toISOString(), slaHours),
      });

      onSuccess();
      onClose();
    } catch {
      setError('Erro ao criar chamado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setError('');

    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

    for (const file of files) {
      if (!allowedExtensions.test(file.name)) {
        setError(`O arquivo "${file.name}" não é uma imagem permitida.`);
        continue; // pula arquivo inválido
      }

      const formDataFile = new FormData();
      formDataFile.append('file', file);

      try {
        const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formDataFile });
        if (!response.ok) throw new Error('Falha no upload do arquivo.');

        const data = await response.json();
        setAttachments(prev => [...prev, { name: data.name, url: data.url }]);
      } catch {
        setError(`Erro ao enviar o arquivo "${file.name}".`);
        break;
      }
    }

    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Chamado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título do Chamado *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite um título descritivo para o problema"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição Detalhada *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o problema em detalhes..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anexos (Somente Imagens)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {isUploading ? 'Enviando imagens...' : 'Clique para selecionar ou arraste e solte aqui'}
              </p>

              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.webp"
              />
              <label
                htmlFor="file-upload"
                className={`text-blue-600 hover:text-blue-700 cursor-pointer text-sm ${isUploading ? 'opacity-50' : ''}`}
              >
                Selecionar Imagens
              </label>

              {isUploading && <Loader2 className="w-5 h-5 text-gray-500 animate-spin mx-auto mt-2" />}
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Imagens selecionadas:</p>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading || !formData.title || !formData.description || !formData.category}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Criando...' : 'Criar Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
