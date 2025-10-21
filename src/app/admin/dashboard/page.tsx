'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Settings
} from 'lucide-react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { adminService } from '@/lib/services';
import { formatPrice } from '@/lib/utils';
import { CommissionSettings } from '@/components/ui/CommissionSettings';
import { useCommission } from '@/hooks/useCommission';

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'transactions' | 'services'>('stats');
  const [showCommissionSettings, setShowCommissionSettings] = useState(false);
  const { commissionPercentage } = useCommission();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Verificar autenticación y permisos de admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const statsResponse = await adminService.getStats();
        
        if (!statsResponse.success) {
          alert('No tienes permisos de administrador. Serás redirigido.');
          router.push('/admin');
          return;
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        alert('Error de autenticación. Serás redirigido.');
        router.push('/admin');
      }
    };

    checkAdminAuth();
  }, [router]);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const loadData = async () => {
    setLoading(true);

    try {
      if (activeTab === 'stats') {
        const statsResponse = await adminService.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } else if (activeTab === 'users') {
        const usersResponse = await adminService.getUsers({
          search: searchTerm || undefined,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        });
        if (usersResponse.success) {
          setUsers(usersResponse.data);
          setTotalItems(usersResponse.count || 0);
        }
      } else if (activeTab === 'transactions') {
        const transactionsResponse = await adminService.getTransactions({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        });
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.data);
          setTotalItems(transactionsResponse.count || 0);
        }
      } else if (activeTab === 'services') {
        const servicesResponse = await adminService.getServices({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        });
        if (servicesResponse.success) {
          setServices(servicesResponse.data);
          setTotalItems(servicesResponse.count || 0);
        }
      }
    } catch (error) {
      console.error('Error general en loadData:', error);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    // Limpiar sessionStorage
    sessionStorage.removeItem('admin_authenticated');
    
    // Limpiar cookies
    document.cookie = 'admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('🔐 Admin logout successful');
    router.push('/admin');
  };

  const handleUpdateTransactionStatus = async (
    transactionId: string,
    status: 'pendiente' | 'completado' | 'rechazado'
  ) => {
    const response = await adminService.updateTransactionStatus(transactionId, status);
    if (response.success) {
      loadData();
    } else {
      alert('Error al actualizar transacción: ' + response.error);
    }
  };

  const handleViewUser = (userId: string) => {
    // Implementar vista detallada de usuario
    console.log('Ver usuario:', userId);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Hommy - Dashboard Administrativo</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'transactions', label: 'Transacciones', icon: DollarSign },
              { id: 'services', label: 'Servicios', icon: Briefcase }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setCurrentPage(1);
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Total Usuarios</span>
                      <Users size={20} className="text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Registrados en la plataforma</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Trabajadores</span>
                      <Briefcase size={20} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalWorkers}</p>
                    <p className="text-xs text-gray-500 mt-1">Profesionales activos</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Servicios</span>
                      <Briefcase size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.pendingServices} pendientes</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Aplicaciones</span>
                      <Users size={20} className="text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                    <p className="text-xs text-gray-500 mt-1">Postulaciones totales</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Transacciones</span>
                      <DollarSign size={20} className="text-pink-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
                    <p className="text-xs text-gray-500 mt-1">Transacciones totales</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Volumen Total</span>
                      <TrendingUp size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalVolume)}</p>
                    <p className="text-xs text-gray-500 mt-1">En transacciones completadas</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Comisiones Ganadas</span>
                      <DollarSign size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalCommissionsEarned || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.totalServicesWithCommission || 0} servicios completados</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Comisión de Servicios</span>
                      <Settings size={20} className="text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{commissionPercentage}%</p>
                    <p className="text-xs text-gray-500 mt-1">Porcentaje aplicado a precios</p>
                    <button
                      onClick={() => setShowCommissionSettings(true)}
                      className="mt-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* Charts placeholder */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>Gráficas de actividad (próximamente)</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Usuarios */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar por nombre, email o teléfono..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={5} className="px-6 py-4">
                            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <UserRow key={user.user_id} user={user} onView={handleViewUser} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}

        {/* Transacciones */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completado">Completadas</option>
                  <option value="rechazado">Rechazadas</option>
                </select>
              </div>
            </div>

            {/* Tabla de transacciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID / Referencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={8} className="px-6 py-4">
                            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TransactionRow
                          key={transaction.id}
                          transaction={transaction}
                          onUpdateStatus={handleUpdateTransactionStatus}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No se encontraron transacciones
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}

        {/* Servicios */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>

            {/* Grid de servicios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : services.length > 0 ? (
                services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                  <p className="text-gray-500">No se encontraron servicios</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}

      </div>

      {/* Modal de configuración de comisiones */}
      {showCommissionSettings && (
        <CommissionSettings onClose={() => setShowCommissionSettings(false)} />
      )}
    </div>
  );
}

// Componente de fila de usuario
function UserRow({ user, onView }: { user: any; onView: (id: string) => void }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBalance = async () => {
      const response = await adminService.getUserBalance(user.user_id);
      if (response.success) {
        setBalance(response.data);
      }
      setLoading(false);
    };
    loadBalance();
  }, [user.user_id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {loading ? (
          <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
        ) : (
          <div className="text-sm font-semibold text-gray-900">{formatPrice(balance || 0)}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onView(user.user_id)}
          className="text-purple-600 hover:text-purple-900 inline-flex items-center space-x-1"
        >
          <Eye size={16} />
          <span>Ver</span>
        </button>
      </td>
    </tr>
  );
}

// Componente de fila de transacción
function TransactionRow({
  transaction,
  onUpdateStatus
}: {
  transaction: any;
  onUpdateStatus: (id: string, status: 'pendiente' | 'completado' | 'rechazado') => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        if (transaction.user_id) {
          const { supabase } = await import('@/lib/supabase');
          const { data } = await supabase
            .from('user_profiles')
            .select('name, email')
            .eq('user_id', transaction.user_id)
            .single();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUserInfo();
  }, [transaction.user_id]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    const icons = {
      pendiente: Clock,
      completado: CheckCircle,
      rechazado: XCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        <Icon size={12} />
        <span>{status}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-xs font-mono text-gray-500">{transaction.id.slice(0, 8)}...</div>
        {transaction.transaction_reference && (
          <div className="text-xs font-mono text-gray-400">{transaction.transaction_reference}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {loadingUser ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        ) : (
          <>
            <div className="text-sm font-medium text-gray-900">{userInfo?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">{userInfo?.email || 'N/A'}</div>
          </>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          transaction.type === 'recarga' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {transaction.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">{formatPrice(Number(transaction.amount))}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 uppercase">{transaction.payment_method}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <select
            value={transaction.status}
            onChange={(e) => {
              onUpdateStatus(transaction.id, e.target.value as any);
              setIsEditing(false);
            }}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        ) : (
          getStatusBadge(transaction.status)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(transaction.created_at)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => setIsEditing(true)}
          className="text-purple-600 hover:text-purple-900 inline-flex items-center space-x-1"
          disabled={transaction.status === 'completado'}
        >
          <Edit size={16} />
          <span>Editar</span>
        </button>
      </td>
    </tr>
  );
}

// Componente de tarjeta de servicio
function ServiceCard({ service }: { service: any }) {
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{service.title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
          {service.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Cliente:</span>
          <span className="font-medium text-gray-900">{service.user?.name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Categoría:</span>
          <span className="font-medium text-gray-900">{service.category?.name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Fecha:</span>
          <span className="font-medium text-gray-900">{formatDate(service.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// Componente de paginación
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

