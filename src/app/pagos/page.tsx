'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Menu,
  X,
  Home,
  MessageCircle,
  CreditCard,
  History,
  ChevronLeft,
  ChevronDown,
  Edit,
  Trash2,
  Phone,
  Heart,
  Eye,
  DollarSign,
  Award,
  CalendarDays,
  Users,
  CheckCircle,
  Star as StarIcon,
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard as CreditCardIcon,
  Smartphone,
  Banknote,
  Zap,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface MetodoPago {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  color: string;
  descripcion: string;
  disponible: boolean;
}

export default function PagosPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRecargar, setShowRecargar] = useState(false);
  const [showRetirar, setShowRetirar] = useState(false);
  const [selectedMetodo, setSelectedMetodo] = useState<string | null>(null);
  const [monto, setMonto] = useState('');

  const balance = 1250000; // $1,250,000 COP

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleVolver = () => {
    router.back();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const metodosPago: MetodoPago[] = [
    {
      id: 'pse',
      nombre: 'PSE',
      icono: <Banknote size={24} />,
      color: 'bg-blue-500',
      descripcion: 'Pagos Seguros en Línea',
      disponible: true
    },
    {
      id: 'nequi',
      nombre: 'Nequi',
      icono: <Smartphone size={24} />,
      color: 'bg-purple-500',
      descripcion: 'Billetera Digital Bancolombia',
      disponible: true
    },
    {
      id: 'daviplata',
      nombre: 'DaviPlata',
      icono: <Zap size={24} />,
      color: 'bg-green-500',
      descripcion: 'Billetera Digital Davivienda',
      disponible: true
    },
    {
      id: 'bancolombia',
      nombre: 'Bancolombia',
      icono: <CreditCardIcon size={24} />,
      color: 'bg-red-500',
      descripcion: 'Transferencia Bancaria',
      disponible: true
    },
    {
      id: 'bancodebogota',
      nombre: 'Banco de Bogotá',
      icono: <CreditCardIcon size={24} />,
      color: 'bg-yellow-500',
      descripcion: 'Transferencia Bancaria',
      disponible: true
    },
    {
      id: 'efectivo',
      nombre: 'Efectivo',
      icono: <DollarSign size={24} />,
      color: 'bg-gray-500',
      descripcion: 'Pago en Efectivo',
      disponible: false
    }
  ];

  const handleRecargar = () => {
    setShowRecargar(true);
    setShowRetirar(false);
  };

  const handleRetirar = () => {
    setShowRetirar(true);
    setShowRecargar(false);
  };

  const handleMetodoSeleccionado = (metodoId: string) => {
    setSelectedMetodo(metodoId);
  };

  const handleConfirmarTransaccion = () => {
    // Aquí iría la lógica de confirmación
    alert(`Transacción ${showRecargar ? 'de recarga' : 'de retiro'} confirmada por ${monto}`);
    setShowRecargar(false);
    setShowRetirar(false);
    setSelectedMetodo(null);
    setMonto('');
  };

  const handleCerrarModal = () => {
    setShowRecargar(false);
    setShowRetirar(false);
    setSelectedMetodo(null);
    setMonto('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#743fc6] to-[#8a5fd1] text-white transition-all duration-300 ease-in-out z-50 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-purple-400/30">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#fbbc6c] rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold">Hommy</h2>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a href="/dashboard" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <Briefcase size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Mis Servicios</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <MessageCircle size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Chat</span>}
            </a>
            <a href="/pagos" className="flex items-center justify-center md:justify-start p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
              <CreditCard size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Pagos</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <History size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Historial</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <User size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Perfil</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <Settings size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Configuración</span>}
            </a>
          </nav>

          {/* Premium CTA */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-white/20">
              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-white text-sm">💼</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">¡Usa nuestras</p>
                      <p className="text-xs font-medium">funciones Premium!</p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <button className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105 w-full">
              <LogOut size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={handleVolver}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pagos y Balance</h1>
                <nav className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  <span>Inicio</span>
                  <span className="mx-2">›</span>
                  <span className="text-[#743fc6]">Pagos</span>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Search size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Mail size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Usuario</span>
                <div className="w-8 h-8 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Balance Disponible</h2>
                  <p className="text-white/80 text-sm">Tu saldo actual</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{formatPrice(balance)}</div>
                <div className="text-white/80 text-sm">COP</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleRecargar}
                className="flex-1 bg-[#fbbc6c] text-white py-3 rounded-xl font-semibold hover:bg-[#f9b055] transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <TrendingUp size={20} />
                Recargar Cuenta
              </button>
              <button
                onClick={handleRetirar}
                className="flex-1 bg-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <TrendingDown size={20} />
                Retirar Dinero
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Transacciones</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Recarga Nequi</h4>
                    <p className="text-sm text-gray-600">15 Oct 2024 - 2:30 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-semibold">+$500,000</div>
                  <div className="text-sm text-gray-500">Completada</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <TrendingDown size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Retiro Bancolombia</h4>
                    <p className="text-sm text-gray-600">12 Oct 2024 - 10:15 AM</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-semibold">-$300,000</div>
                  <div className="text-sm text-gray-500">Completada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Métodos de Pago */}
      {(showRecargar || showRetirar) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {showRecargar ? 'Recargar Cuenta' : 'Retirar Dinero'}
                </h3>
                <button
                  onClick={handleCerrarModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Monto */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ingresa el monto"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#743fc6] focus:border-transparent"
                />
              </div>

              {/* Métodos de Pago */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Método de Pago</h4>
                <div className="grid grid-cols-1 gap-3">
                  {metodosPago.map((metodo) => (
                    <button
                      key={metodo.id}
                      onClick={() => handleMetodoSeleccionado(metodo.id)}
                      disabled={!metodo.disponible}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                        selectedMetodo === metodo.id
                          ? 'border-[#743fc6] bg-[#743fc6]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!metodo.disponible ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-12 h-12 ${metodo.color} rounded-xl flex items-center justify-center text-white`}>
                        {metodo.icono}
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-800">{metodo.nombre}</h5>
                        <p className="text-sm text-gray-600">{metodo.descripcion}</p>
                      </div>
                      {selectedMetodo === metodo.id && (
                        <CheckCircle2 size={20} className="text-[#743fc6]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón Confirmar */}
              <button
                onClick={handleConfirmarTransaccion}
                disabled={!selectedMetodo || !monto}
                className="w-full py-3 bg-[#743fc6] text-white rounded-xl font-semibold hover:bg-[#6a37b8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar {showRecargar ? 'Recarga' : 'Retiro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 