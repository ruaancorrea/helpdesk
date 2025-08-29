import { useState, useEffect } from 'react';
import { Save, Clock, Mail, Shield } from 'lucide-react';
import { getSLAConfig, updateSLAConfig } from '../../utils/api';
import { SLAConfig } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { API_URL } from '../../utils/api'; // Importar a API_URL corretamente

export default function Settings() {
  const { settings, updateSettings, isLoading: isLoadingSettings } = useSettings();
  const [slaConfig, setSlaConfig] = useState<SLAConfig[]>([]);
  
  const [localGeneralSettings, setLocalGeneralSettings] = useState(settings?.general);
  const [localEmailSettings, setLocalEmailSettings] = useState(settings?.email);
  
  const [isLoadingSLA, setIsLoadingSLA] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const handleSendTestEmail = async () => {
    if (!testEmail) {
        alert('Por favor, digite um e-mail para enviar o teste.');
        return;
    }
    setIsSaving(true);
    try {
        const response = await fetch(`${API_URL}/send-test-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: testEmail }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        alert('E-mail de teste enviado com sucesso!');
    } catch (error: any) { // Corrigido o tipo do erro aqui
        console.error('Erro ao enviar e-mail de teste:', error);
        alert(`Erro ao enviar e-mail: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  useEffect(() => {
    if(settings) {
      setLocalGeneralSettings(settings.general);
      setLocalEmailSettings(settings.email);
    }
  }, [settings]);

  useEffect(() => {
    const loadSla = async () => {
      try {
        setIsLoadingSLA(true);
        const slaData = await getSLAConfig();
        setSlaConfig(slaData);
      } catch (error) {
        console.error('Erro ao carregar configurações de SLA:', error);
      } finally {
        setIsLoadingSLA(false);
      }
    };
    loadSla();
  }, []);

  const handleSLAUpdate = async (id: string, field: 'responseHours' | 'resolutionHours', value: number) => {
    try {
      await updateSLAConfig(id, { [field]: value });
      setSlaConfig(prev => prev.map(config => 
        config.id === id 
          ? { ...config, [field]: value }
          : config
      ));
    } catch (error) {
      console.error('Erro ao atualizar SLA:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!localGeneralSettings || !localEmailSettings) return;
    setIsSaving(true);
    try {
      await updateSettings({
        general: localGeneralSettings,
        email: localEmailSettings
      });
      alert('Configurações salvas com sucesso no banco de dados!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações!');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[priority] || priority;
  };

  if (isLoadingSettings || isLoadingSLA || !localGeneralSettings || !localEmailSettings) {
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
                      onChange={(e) => handleSLAUpdate(config.id, 'responseHours', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={config.resolutionHours}
                      onChange={(e) => handleSLAUpdate(config.id, 'resolutionHours', parseInt(e.target.value))}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Servidor SMTP</label>
            <input
              type="text"
              value={localEmailSettings.smtpServer}
              onChange={(e) => setLocalEmailSettings(prev => ({...prev!, smtpServer: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Porta SMTP</label>
            <input
              type="number"
              value={localEmailSettings.smtpPort}
              onChange={(e) => setLocalEmailSettings(prev => ({...prev!, smtpPort: parseInt(e.target.value) || 0}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuário SMTP (Seu e-mail)</label>
            <input
              type="email"
              value={localEmailSettings.smtpUser}
              onChange={(e) => setLocalEmailSettings(prev => ({...prev!, smtpUser: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha SMTP (Senha de App)</label>
            <input
              type="password"
              value={localEmailSettings.smtpPassword}
              onChange={(e) => setLocalEmailSettings(prev => ({...prev!, smtpPassword: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enviar E-mail de Teste</label>
            <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="Digite um e-mail de destino"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSaving}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Enviar
                </button>
            </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={localGeneralSettings.companyName}
              onChange={(e) => setLocalGeneralSettings(prev => ({...prev!, companyName: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail de Suporte</label>
            <input
              type="email"
              value={localGeneralSettings.supportEmail}
              onChange={(e) => setLocalGeneralSettings(prev => ({...prev!, supportEmail: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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