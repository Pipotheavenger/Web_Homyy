'use client';
import Layout from '@/components/Layout';
import { useProfessionals } from '@/hooks/useProfessionals';
import { SearchHeader } from '@/components/ui/SearchHeader';
import { ProfessionalCard } from '@/components/ui/ProfessionalCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ProfesionalesPage() {
  const { searchTerm, setSearchTerm, filteredProfesionales } = useProfessionals();

  return (
    <Layout title="Profesionales" currentPage="profesionales">
      <div className="p-6">
        {/* Header con búsqueda */}
        <SearchHeader
          title="Encuentra Profesionales"
          subtitle="Conecta con profesionales calificados para tus servicios"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar profesionales..."
        />

        {/* Grid de profesionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfesionales.map((profesional) => (
            <ProfessionalCard key={profesional.id} profesional={profesional} />
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredProfesionales.length === 0 && (
          <EmptyState
            title="No se encontraron profesionales"
            description="Intenta con otros términos de búsqueda"
          />
        )}
      </div>
    </Layout>
  );
} 