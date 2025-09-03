// Em: src/components/Users/UserManagement.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Mail, Phone, User as UserIcon, FileUp, Trash2 } from 'lucide-react'; // 1. Importar Trash2
import { getUsers, bulkCreateUsers, deleteUser } from '../../utils/api'; // 2. Importar deleteUser
import { User as UserType } from '../../types';
import UserForm from './UserForm';
import * as XLSX from 'xlsx';
import { useAuth } from '../../hooks/useAuth'; // 3. Importar useAuth

export default function UserManagement() {
  const { user: loggedInUser } = useAuth(); // 4. Obter o utilizador logado
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getUsers();
      setUsers(usersData.filter(u => u.role === 'user'));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  // 5. ADICIONAR A FUNÇÃO DE EXCLUSÃO
  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem a certeza de que deseja apagar este usuário permanentemente?')) {
        try {
            await deleteUser(userId);
            alert('Usuário apagado com sucesso.');
            loadUsers(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao apagar usuário:', error);
            alert('Não foi possível apagar o usuário.');
        }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleFormSuccess = () => {
    loadUsers();
    handleFormClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length > 0) {
          if (window.confirm(`Foram encontrados ${json.length} usuários na planilha. Deseja importá-los agora?`)) {
            setIsLoading(true);
            await bulkCreateUsers(json);
            alert('Usuários importados com sucesso!');
            loadUsers();
          }
        } else {
          alert('Nenhum usuário encontrado na planilha.');
        }
      } catch (error: any) {
        console.error("Erro ao processar a planilha:", error);
        alert(`Ocorreu um erro: ${error.message}. Verifique se as colunas estão corretas: Nome, Email, Departamento, Senha.`);
      } finally {
        setIsLoading(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              id="user-import-input"
              accept=".xlsx, .xls, .csv"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <FileUp size={20} />
              <span>Importar</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                {/* 6. ADICIONAR O BOTÃO DE APAGAR (SÓ PARA ADMINS) */}
                {loggedInUser?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserIcon size={16} />
                <span>{user.department}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}