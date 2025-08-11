import { Camera, Edit, Save, X, Award, Clock, DollarSign, Star } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  fechaRegistro: string;
  foto: string;
  calificacion: number;
  serviciosCompletados: number;
  serviciosActivos: number;
  balance: number;
  preferencias: {
    notificaciones: boolean;
    emailMarketing: boolean;
    privacidad: boolean;
  };
}

interface ProfileHeaderProps {
  usuario: Usuario;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  formatPrice: (price: number) => string;
}

export const ProfileHeader = ({ 
  usuario, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  formatPrice 
}: ProfileHeaderProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Foto de perfil */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-2xl text-white font-bold">
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                `${usuario.nombre[0]}${usuario.apellido[0]}`
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#fbbc6c] rounded-full flex items-center justify-center hover:bg-[#f9b055] transition-colors">
              <Camera size={16} className="text-white" />
            </button>
          </div>

          {/* Información básica */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {usuario.nombre} {usuario.apellido}
            </h1>
            <p className="text-gray-600 mb-2">Miembro desde {usuario.fechaRegistro}</p>
            
            {/* Calificación */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(usuario.calificacion)}
              </div>
              <span className="text-sm font-medium text-gray-700">{usuario.calificacion}</span>
              <span className="text-sm text-gray-500">({usuario.serviciosCompletados} servicios)</span>
            </div>
          </div>
        </div>

        {/* Botón de editar */}
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="flex items-center space-x-2 px-4 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#6a37b8] transition-colors"
              >
                <Save size={16} />
                <span>Guardar</span>
              </button>
              <button
                onClick={onCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
                <span>Cancelar</span>
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit size={16} />
              <span>Editar Perfil</span>
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-[#743fc6]/10 to-[#8a5fd1]/10 rounded-xl p-4 border border-[#743fc6]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#743fc6] rounded-lg flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Servicios Completados</p>
              <p className="text-xl font-bold text-gray-800">{usuario.serviciosCompletados}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fbbc6c]/10 to-[#f9b055]/10 rounded-xl p-4 border border-[#fbbc6c]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#fbbc6c] rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Servicios Activos</p>
              <p className="text-xl font-bold text-gray-800">{usuario.serviciosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-xl font-bold text-gray-800">{formatPrice(usuario.balance)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 