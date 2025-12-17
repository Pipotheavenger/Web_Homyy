'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp,
  TrendingDown,
  Smartphone,
  Zap,
  CheckCircle2,
  Wallet,
  X,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { QRModal } from '@/components/ui/QRModal';
import { PaymentSuccessModal } from '@/components/ui/PaymentSuccessModal';
import { transactionsService, Transaction } from '@/lib/services';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTransactionRef, setCurrentTransactionRef] = useState('');
  const [modalAmount, setModalAmount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Cargar balance
    const balanceResponse = await transactionsService.getBalance();
    if (balanceResponse.success && balanceResponse.data !== null) {
      setBalance(balanceResponse.data);
    }

    // Cargar transacciones
    const transactionsResponse = await transactionsService.getMyTransactions();
    if (transactionsResponse.success) {
      setTransactions(transactionsResponse.data);
    }

    setLoading(false);
  };

  const handleVolver = () => {
    router.back();
  };

  // Solo Nequi y DaviPlata para recargas
  const metodosRecarga: MetodoPago[] = [
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
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      descripcion: 'Billetera Digital Davivienda',
      disponible: true
    }
  ];

  const handleRecargar = () => {
    setShowRecargar(true);
  };

  const handleMetodoSeleccionado = (metodoId: string) => {
    setSelectedMetodo(metodoId);
  };

  const handleConfirmarTransaccion = () => {
    if (showRecargar && selectedMetodo && monto) {
      // Mostrar modal QR para confirmar pago
      setShowQRModal(true);
      setShowRecargar(false);
    }
  };

  const handleCerrarModal = () => {
    setShowRecargar(false);
    setSelectedMetodo(null);
    setMonto('');
  };

  const handleCerrarQRModal = () => {
    setShowQRModal(false);
    setSelectedMetodo(null);
    setMonto('');
  };

  const handleConfirmarPago = async () => {
    // Crear transacción en la base de datos
    const transactionRef = `TXN-${Date.now()}`;
    const response = await transactionsService.create({
      type: 'recarga',
      amount: parseFloat(monto),
      payment_method: selectedMetodo || 'nequi',
      transaction_reference: transactionRef,
      description: `Recarga ${selectedMetodo?.toUpperCase()}`,
      status: 'pendiente'
    });

    if (response.success) {
      setCurrentTransactionRef(transactionRef);
      setModalAmount(parseFloat(monto));
      setShowQRModal(false);
      setShowSuccessModal(true);
      
      // Recargar datos
      await loadData();
    } else {
      alert('Error al procesar la transacción: ' + response.error);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setMonto('');
    setSelectedMetodo(null);
  };

  const handleConfirmarRetiro = async () => {
    if (!selectedMetodo || !monto || parseInt(monto) > balance) {
      alert('Monto inválido o insuficiente');
      return;
    }

    const transactionRef = `RET-${Date.now()}`;
    const response = await transactionsService.create({
      type: 'retiro',
      amount: parseFloat(monto), // Positivo - el tipo 'retiro' indica que resta
      payment_method: selectedMetodo,
      transaction_reference: transactionRef,
      description: `Retiro ${selectedMetodo?.toUpperCase()}`,
      status: 'pendiente'
    });

    if (response.success) {
      setCurrentTransactionRef(transactionRef);
      setShowRetirar(false);
      setShowSuccessModal(true);
      
      // Recargar datos
      await loadData();
    } else {
      alert('Error al procesar el retiro: ' + response.error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
      case 'completada':
        return 'from-green-50/80 to-blue-50/80 border-green-200/30';
      case 'pendiente':
        return 'from-yellow-50/80 to-orange-50/80 border-yellow-200/30';
      case 'rechazado':
        return 'from-red-50/80 to-pink-50/80 border-red-200/30';
      default:
        return 'from-gray-50/80 to-gray-100/80 border-gray-200/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
      case 'completada':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'pendiente':
        return <Clock size={20} className="text-yellow-600" />;
      case 'rechazado':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completado':
      case 'completada':
        return 'Completada';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazado':
        return 'Rechazada';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recarga':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp size={20} className="text-white" />
          </div>
        );
      case 'debito':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingDown size={20} className="text-white" />
          </div>
        );
      case 'retiro':
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingDown size={20} className="text-white" />
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout 
      title="Pagos y Balance"
      breadcrumbs={[
        { label: 'Inicio', href: '/user/dashboard' },
        { label: 'Pagos', active: true }
      ]}
      showBackButton={true}
      onBackClick={handleVolver}
      currentPage="pagos"
    >
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-blue-50/30 min-h-screen max-w-full overflow-x-hidden">
        {/* Balance Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-4 sm:p-6 mb-4 sm:mb-6 w-full max-w-full overflow-hidden">
          {/* Layout vertical para pantallas <425px, horizontal para pantallas más grandes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Wallet size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">Balance Disponible</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Tu saldo actual</p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-full sm:w-32 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 break-words">{formatPrice(balance)}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">COP</div>
                </>
              )}
            </div>
          </div>
          
          {/* Botones en vertical para pantallas <425px, horizontal para pantallas más grandes */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleRecargar}
              className="w-full sm:flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              Recargar Cuenta
            </button>
            <button
              onClick={() => setShowRetirar(true)}
              disabled={balance <= 0}
              className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <TrendingDown size={18} className="sm:w-5 sm:h-5" />
              Retirar Dinero
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-4 sm:p-6 w-full max-w-full overflow-hidden">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Historial de Transacciones</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4 h-20"></div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`bg-gradient-to-r ${getStatusColor(transaction.status)} border rounded-xl p-3 sm:p-4 w-full max-w-full overflow-hidden`}
                >
                  {/* Layout vertical para pantallas <425px, horizontal para pantallas más grandes */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">{getTypeIcon(transaction.type)}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                          {transaction.type === 'recarga' ? 'Recarga' : 
                           transaction.type === 'debito' ? 'Pago de Servicio' : 'Retiro'} {transaction.payment_method.toUpperCase()}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                        {transaction.transaction_reference && (
                          <p className="text-xs text-gray-500 font-mono break-all">{transaction.transaction_reference}</p>
                        )}
                        {transaction.description && (
                          <p className="text-xs text-gray-500 break-words">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                      <div className={`font-semibold text-base sm:text-lg ${
                        transaction.type === 'recarga' ? 'text-green-600' : 'text-red-600'
                      } break-words`}>
                        {transaction.type === 'recarga' ? '+' : '-'}{formatPrice(Number(transaction.amount))}
                      </div>
                      <div className="flex items-center space-x-1 text-xs sm:text-sm mt-1">
                        {getStatusIcon(transaction.status)}
                        <span className="text-gray-600">{getStatusText(transaction.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={24} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No hay transacciones</h4>
              <p className="text-gray-600 mb-4">Aún no has realizado ninguna transacción</p>
              <button
                onClick={handleRecargar}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Hacer mi primera recarga
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Métodos de Pago */}
      {showRecargar && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(116,63,198,0.15)] border border-white/40">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={24} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Recargar Cuenta</h3>
                    <p className="text-xs text-gray-500 font-medium">Elige tu método de pago</p>
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
                  Monto a recargar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="50,000"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-lg font-semibold text-gray-900 placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Monto mínimo: $10,000 COP</p>
              </div>

              {/* Métodos de Pago */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Método de Pago</h4>
                <div className="grid grid-cols-1 gap-3">
                  {metodosRecarga.map((metodo) => (
                    <button
                      key={metodo.id}
                      onClick={() => handleMetodoSeleccionado(metodo.id)}
                      disabled={!metodo.disponible}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                        selectedMetodo === metodo.id
                          ? 'border-purple-500 bg-purple-50/80 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 bg-white/60 hover:shadow-sm'
                      } ${!metodo.disponible ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-12 h-12 ${metodo.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {metodo.icono}
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-800">{metodo.nombre}</h5>
                        <p className="text-xs text-gray-600">{metodo.descripcion}</p>
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
                disabled={!selectedMetodo || !monto || parseInt(monto) < 10000}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500"
              >
                Continuar con el pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Retiro */}
      {showRetirar && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(116,63,198,0.15)] border border-white/40">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingDown size={24} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Retirar Dinero</h3>
                    <p className="text-xs text-gray-500 font-medium">Elige tu método de retiro</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRetirar(false)}
                  className="w-8 h-8 bg-gray-100/60 hover:bg-gray-200/60 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Balance disponible */}
              <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Balance disponible:</span>
                  <span className="text-lg font-bold text-purple-600">{formatPrice(balance)}</span>
                </div>
              </div>

              {/* Monto */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a retirar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="50,000"
                    max={balance}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-lg font-semibold text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Monto mínimo: $10,000 COP</p>
              </div>

              {/* Métodos de Retiro */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Método de Retiro</h4>
                <div className="grid grid-cols-1 gap-3">
                  {metodosRecarga.map((metodo) => (
                    <button
                      key={metodo.id}
                      onClick={() => handleMetodoSeleccionado(metodo.id)}
                      disabled={!metodo.disponible}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                        selectedMetodo === metodo.id
                          ? 'border-purple-500 bg-purple-50/80 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 bg-white/60 hover:shadow-sm'
                      } ${!metodo.disponible ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-12 h-12 ${metodo.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {metodo.icono}
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-800">{metodo.nombre}</h5>
                        <p className="text-xs text-gray-600">{metodo.descripcion}</p>
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
                onClick={handleConfirmarRetiro}
                disabled={!selectedMetodo || !monto || parseInt(monto) < 10000 || parseInt(monto) > balance}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600"
              >
                Confirmar Retiro
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

      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        amount={modalAmount}
        paymentMethod={selectedMetodo || ''}
        transactionRef={currentTransactionRef}
      />
    </Layout>
  );
}
