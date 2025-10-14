'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { adminService } from '@/lib/api/admin';

interface CommissionSettingsProps {
  onClose: () => void;
}

export const CommissionSettings = ({ onClose }: CommissionSettingsProps) => {
  const [commissionPercentage, setCommissionPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCommissionSettings();
  }, []);

  const loadCommissionSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCommissionPercentage();
      if (response.success && response.data) {
        setCommissionPercentage(response.data);
      }
    } catch (error) {
      setError('Error al cargar configuración de comisión');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      console.log('💾 Guardando comisión:', commissionPercentage);
      const response = await adminService.updateCommissionPercentage(commissionPercentage);
      console.log('💾 Respuesta:', response);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError(response.error || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('💾 Error al guardar:', error);
      setError('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handlePercentageChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setCommissionPercentage(numValue);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Comisión de Servicios</h2>
                <p className="text-white/80 text-sm">Configurar porcentaje de incremento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-green-700 text-sm">¡Configuración guardada exitosamente!</span>
            </motion.div>
          )}

          {/* Commission Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Porcentaje de Comisión
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionPercentage}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                  placeholder="10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <TrendingUp size={16} className="text-purple-500" />
                  <span className="text-purple-500 font-semibold">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este porcentaje se aplicará a los precios propuestos por los trabajadores antes de mostrarlos a los usuarios.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-700 mb-2">Vista Previa</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio original del trabajador:</span>
                  <span className="font-semibold">$100,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comisión ({commissionPercentage}%):</span>
                  <span className="font-semibold text-purple-600">
                    +${(100000 * commissionPercentage / 100).toLocaleString()}
                  </span>
                </div>
                <hr className="border-purple-200" />
                <div className="flex justify-between font-bold text-purple-700">
                  <span>Precio final para el usuario:</span>
                  <span>
                    ${(100000 * (1 + commissionPercentage / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
