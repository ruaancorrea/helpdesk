import React, { useState, useEffect } from 'react';
import { Save, Clock, Mail, Shield, Database } from 'lucide-react';
import { getSLAConfig, updateSLAConfig } from '../../utils/api';
import { SLAConfig } from '../../types';

export default function Settings() {
  const [slaConfig, setSlaConfig] = useState<SLAConfig[]>([]);
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    notifyOnNew: true,
    notifyOnUpdate: true,
    notifyOnClose: true,
  });
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'HelpDesk Pro',
    supportEmail: 'suporte@empresa.com',
    maxFileSize: 10, // MB
    allowedFileTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    autoAssignment: true,
    requireApproval: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const slaData = await getSLAConfig();
      setSlaConfig(slaData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSLAUpdate = async (priority: string, field: 'responseHours' | 'resolutionHours', value: number) => {
    try {
      await updateSLAConfig(priority, { [field]: value });
      setSlaConfig(prev => prev.map(config => 
        config.priority === priority 
          ? { ...config, [field]: value }
          : config
      ));
    } catch (error) {
      console.error('Erro ao atualizar SLA:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real application, you would save these settings to a backend
      localStorage.setItem('helpdesk_email_settings', JSON.stringify(emailSettings));
      localStorage.setItem('helpdesk_general_settings', JSON.stringify(generalSettings));
      
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações!');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SLA Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configuração de SLA</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Prioridade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tempo de Resposta (horas)</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tempo de Resolução (horas)</th>
              </tr>
            </thead>
            <tbody>
              {slaConfig.map((config) => (
                <tr key={config.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      config.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      config.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      config.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getPriorityLabel(config.priority)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={config.responseHours}
                      onChange={(e) => handleSLAUpdate(config.priority, 'responseHours', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={config.resolutionHours}
                      onChange={(e) => handleSLAUpdate(config.priority, 'resolutionHours', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configuração de E-mail</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servidor SMTP
            </label>
            <input
              type="text"
              value={emailSettings.smtpServer}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porta SMTP
            </label>
            <input
              type="number"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário SMTP
            </label>
            <input
              type="email"
              value={emailSettings.smtpUser}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha SMTP
            </label>
            <input
              type="password"
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Notificações por E-mail</h3>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={emailSettings.notifyOnNew}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, notifyOnNew: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Notificar ao criar novo chamado</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={emailSettings.notifyOnUpdate}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, notifyOnUpdate: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Notificar ao atualizar chamado</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={emailSettings.notifyOnClose}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, notifyOnClose: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Notificar ao fechar chamado</span>
            </label>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configurações Gerais</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={generalSettings.companyName}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail de Suporte
            </label>
            <input
              type="email"
              value={generalSettings.supportEmail}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho Máximo de Arquivo (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={generalSettings.maxFileSize}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Arquivo Permitidos
            </label>
            <input
              type="text"
              value={generalSettings.allowedFileTypes}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Configurações do Sistema</h3>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={generalSettings.autoAssignment}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, autoAssignment: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Atribuição automática de chamados</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={generalSettings.requireApproval}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Requer aprovação para fechamento</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={18} />
          <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </div>
  );
}