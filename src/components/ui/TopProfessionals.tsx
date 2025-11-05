import { Star, User } from 'lucide-react';

interface TopProfessionalsProps {
  professionals: any[];
}

export const TopProfessionals = ({ professionals }: TopProfessionalsProps) => {
  if (!professionals || professionals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Profesionales Destacados</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600 text-sm">No hay profesionales disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Profesionales Destacados</h3>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        {professionals.map((worker) => (
          <div key={worker.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              {worker.user?.profile_picture_url ? (
                <img 
                  src={worker.user.profile_picture_url} 
                  alt={worker.user.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User size={24} className="text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{worker.user?.name || 'Profesional'}</h4>
              <p className="text-sm text-gray-600">{worker.profession}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{Number(worker.rating || 0).toFixed(1)}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {worker.total_services || 0} servicios
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 