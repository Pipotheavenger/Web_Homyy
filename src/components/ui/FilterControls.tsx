import { Filter, SortAsc } from 'lucide-react';

interface FilterControlsProps {
  selectedFilter: string;
  selectedSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  totalPostulantes: number;
}

export const FilterControls = ({ 
  selectedFilter, 
  selectedSort, 
  onFilterChange, 
  onSortChange, 
  totalPostulantes 
}: FilterControlsProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <SortAsc size={16} className="text-gray-500" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
            >
              <option value="reciente">Más recientes</option>
              <option value="experiencia">Más experiencia</option>
              <option value="calificacion">Mejor calificación</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {totalPostulantes} postulante{totalPostulantes !== 1 ? 's' : ''} encontrado{totalPostulantes !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}; 