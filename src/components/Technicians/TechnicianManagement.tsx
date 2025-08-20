import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, User, Mail, Phone, Wrench } from 'lucide-react';
import { getUsers, createUser, updateUser } from '../../utils/api';
import { User as UserType } from '../../types';
import TechnicianForm from './TechnicianForm';

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<UserType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setIsLoading(true);
      const usersData = await getUsers();
      setTechnicians(usersData.filter(u => u.role === 'technician'));
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTechnicians = technicians.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (technician: UserType) => {
    setSelectedTechnician(technician);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedTechnician(null);
  };

  const handleFormSuccess = () => {
    loadTechnicians();
    handleFormClose();
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar técnicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Novo Técnico</span>
          </button>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((technician) => (
          <div key={technician.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{technician.name}</h3>
                  <p className="text-sm text-gray-500">{technician.position}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Técnico
                </span>
                <button
                  onClick={() => handleEdit(technician)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{technician.email}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{technician.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>{technician.department}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Especialidade: {technician.department}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  Ativo
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredTechnicians.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum técnico encontrado</p>
          </div>
        )}
      </div>

      {/* Technician Form Modal */}
      {showForm && (
        <TechnicianForm
          technician={selectedTechnician}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}