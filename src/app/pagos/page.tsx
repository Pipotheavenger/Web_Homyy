'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp,
  TrendingDown,
  CreditCard as CreditCardIcon,
  Smartphone,
  Banknote,
  Zap,
  Shield,
  CheckCircle2,
  Wallet,
  X,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';
import Layout from '@/components/Layout';
import { QRModal } from '@/components/ui/QRModal';
import { formatPrice } from '@/lib/utils';

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
  const [showRecargar, setShowRecargar] = useState(false);
  const [showRetirar, setShowRetirar] = useState(false);
  const [selectedMetodo, setSelectedMetodo] = useState<string | null>(null);
  const [monto, setMonto] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const balance = 1250000; // $1,250,000 COP

  const handleVolver = () => {
    router.back();
  };

  // Solo PSE, Nequi y Daviplata para recargas
  const metodosRecarga: MetodoPago[] = [
    {
      id: 'pse',
      nombre: 'PSE',
      icono: <Banknote size={24} />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      descripcion: 'Pagos Seguros en Línea',
      disponible: true
    },
    {
      id: 'nequi',
      nombre: 'Nequi',
      icono: <Smartphone size={24} />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      descripcion: 'Billetera Digital Bancolombia',
      disponible: true
    },
    {
      id: 'daviplata',
      nombre: 'DaviPlata',
      icono: <Zap size={24} />,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      descripcion: 'Billetera Digital Davivienda',
      disponible: true
    }
  ];

  // Métodos completos para retiros
  const metodosRetiro: MetodoPago[] = [
    ...metodosRecarga,
    {
      id: 'bancolombia',
      nombre: 'Bancolombia',
      icono: <CreditCardIcon size={24} />,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      descripcion: 'Transferencia Bancaria',
      disponible: true
    },
    {
      id: 'bancodebogota',
      nombre: 'Banco de Bogotá',
      icono: <CreditCardIcon size={24} />,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      descripcion: 'Transferencia Bancaria',
      disponible: true
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
    if (showRecargar) {
      // Para recargas, mostrar el QR modal
      console.log('Monto a pasar al QRModal:', monto, 'Tipo:', typeof monto);
      setShowQRModal(true);
      setShowRecargar(false);
    } else {
      // Para retiros, lógica normal
      alert(`Transacción de retiro confirmada por ${monto}`);
      setShowRetirar(false);
    }
    // No limpiar el monto aquí para que se mantenga en el QRModal
    setSelectedMetodo(null);
  };

  const handleCerrarModal = () => {
    setShowRecargar(false);
    setShowRetirar(false);
    setSelectedMetodo(null);
    setMonto('');
  };

  const handleCerrarQRModal = () => {
    setShowQRModal(false);
    setMonto(''); // Limpiar el monto solo al cerrar el QRModal
  };

  const handleConfirmarPago = () => {
    // Aquí se podría agregar la lógica para confirmar el pago
    console.log('Pago confirmado por el usuario');
    // Mostrar mensaje de éxito o actualizar el balance
    alert('¡Pago confirmado! Tu recarga se procesará en 5-10 minutos.');
    setMonto(''); // Limpiar el monto después de confirmar
  };

  const metodosActuales = showRecargar ? metodosRecarga : metodosRetiro;

  return (
    <Layout 
      title="Pagos y Balance"
      breadcrumbs={[
        { label: 'Inicio', href: '/dashboard' },
        { label: 'Pagos', active: true }
      ]}
      showBackButton={true}
      onBackClick={handleVolver}
      currentPage="pagos"
    >
      {/* Content */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-blue-50/30 min-h-screen">
        {/* Balance Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Balance Disponible</h2>
                <p className="text-gray-600 text-sm">Tu saldo actual</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{formatPrice(balance)}</div>
              <div className="text-gray-600 text-sm">COP</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleRecargar}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Recargar Cuenta
            </button>
            <button
              onClick={handleRetirar}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200 flex items-center justify-center gap-2"
            >
              <TrendingDown size={20} />
              Retirar Dinero
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Transacciones</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 border border-green-200/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
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
            </div>
            
            <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 border border-red-200/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(116,63,198,0.15)] border border-white/40">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-lg">
                    {showRecargar ? <TrendingUp size={24} className="text-purple-500" /> : <TrendingDown size={24} className="text-purple-500" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {showRecargar ? 'Recargar Cuenta' : 'Retirar Dinero'}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {showRecargar ? 'Elige tu método de pago' : 'Elige tu método de retiro'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCerrarModal}
                  className="w-8 h-8 bg-gray-100/60 hover:bg-gray-200/60 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <X size={16} className="text-gray-500" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Métodos de Pago */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Método de Pago</h4>
                <div className="grid grid-cols-1 gap-3">
                  {metodosActuales.map((metodo) => (
                    <button
                      key={metodo.id}
                      onClick={() => handleMetodoSeleccionado(metodo.id)}
                      disabled={!metodo.disponible}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                        selectedMetodo === metodo.id
                          ? 'border-purple-500 bg-purple-50/80'
                          : 'border-gray-200 hover:border-gray-300 bg-white/60'
                      } ${!metodo.disponible ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-12 h-12 ${metodo.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {metodo.icono}
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-800">{metodo.nombre}</h5>
                        <p className="text-sm text-gray-600">{metodo.descripcion}</p>
                      </div>
                      {selectedMetodo === metodo.id && (
                        <CheckCircle2 size={20} className="text-purple-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón Confirmar */}
              <button
                onClick={handleConfirmarTransaccion}
                disabled={!selectedMetodo || !monto}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar {showRecargar ? 'Recarga' : 'Retiro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={handleCerrarQRModal}
        metodoPago={selectedMetodo || ''}
        monto={parseInt(monto) || 0}
        onConfirmPayment={handleConfirmarPago}
      />
    </Layout>
  );
} 