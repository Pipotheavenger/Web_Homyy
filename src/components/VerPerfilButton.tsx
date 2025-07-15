'use client';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';

interface VerPerfilButtonProps {
  profesionalId: string | number;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function VerPerfilButton({ 
  profesionalId, 
  className = "px-3 py-1 bg-[#743fc6] text-white rounded-lg hover:bg-[#8a5fd1] transition-colors text-xs font-medium",
  showIcon = false,
  children = "Ver Perfil"
}: VerPerfilButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/perfil-profesional?id=${profesionalId}`);
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      {showIcon && <Eye size={14} className="mr-1" />}
      {children}
    </button>
  );
} 