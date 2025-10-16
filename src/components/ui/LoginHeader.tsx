
import React, { useState } from 'react';

interface LoginHeaderProps {
  showSlogan?: boolean;
}

export const LoginHeader = ({ showSlogan = true }: LoginHeaderProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8 animate-fade-in-up">
      <div className="relative group">
        {!imageError ? (
          <img
            src="/Logo.png" 
            alt="Logo Hommy" 
            width={80} 
            height={80} 
            className="transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center">
            {/* Logo SVG inline como fallback */}
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              fill="none"
            >
              <circle cx="20" cy="20" r="18" fill="white" />
              <text 
                x="20" 
                y="28" 
                textAnchor="middle" 
                fontSize="22" 
                fontWeight="bold" 
                fill="#743fc6"
              >
                H
              </text>
            </svg>
          </div>
        )}
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