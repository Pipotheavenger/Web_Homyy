import Image from 'next/image';

interface LoginHeaderProps {
  showSlogan?: boolean;
}

export const LoginHeader = ({ showSlogan = true }: LoginHeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8 animate-fade-in-up">
      <div className="relative group">
        <Image
          src="/logo.svg" 
          alt="Logo Hommy" 
          width={80} 
          height={80} 
          priority
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#743fc6] to-[#8a5fd1] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>
      <h1 className="text-5xl sm:text-6xl font-display font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Hommy
      </h1>
      {showSlogan && (
        <p className="max-w-xs text-center text-gray-600 font-medium text-sm sm:text-base">
          Expertos confiables para tu hogar, al instante.
        </p>
      )}
    </div>
  );
}; 