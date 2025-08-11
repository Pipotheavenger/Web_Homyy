import { Star } from 'lucide-react';

interface Professional {
  id: number;
  name: string;
  profession: string;
  rating: number;
  avatar: string;
}

interface TopProfessionalsProps {
  professionals: Professional[];
}

export const TopProfessionals = ({ professionals }: TopProfessionalsProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Profesionales Destacados</h3>
        <button className="text-[#743fc6] hover:text-[#8a5fd1] text-sm font-medium">
          Ver todos
        </button>
      </div>
      
      <div className="space-y-4">
        {professionals.map((professional) => (
          <div key={professional.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-2xl">
              {professional.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{professional.name}</h4>
              <p className="text-sm text-gray-600">{professional.profession}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{professional.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 