interface GoogleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const GoogleButton = ({ onClick, children }: GoogleButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 py-3 sm:py-4 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 font-semibold hover:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99] font-sans group text-sm sm:text-base"
    >
      <span className="flex items-center justify-center shrink-0 w-5 h-5 sm:w-6 sm:h-6">
        <svg className="w-full h-full block" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M17.64 9.2045c0-.638-.0573-1.2527-.1636-1.8409H9v3.4818h4.8445c-.2082 1.1227-.8345 2.0755-1.7764 2.7182v2.2582h2.8736C16.9782 14.1636 17.64 11.9273 17.64 9.2045z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1864l-2.8736-2.2582c-.7973.5345-1.8136.8491-3.0827.8491-2.3727 0-4.3845-1.6027-5.1045-3.7573H.8782v2.3164C2.3609 16.8973 5.4545 18 9 18z" fill="#34A853"/>
            <path d="M3.8955 10.6473c-.1818-.5345-.2864-1.1055-.2864-1.6973s.1045-1.1627.2864-1.6973V4.9364H.8782C.3182 6.1055 0 7.5055 0 9c0 1.4945.3182 2.8945.8782 4.0636l3.0173-2.4163z" fill="#FBBC05"/>
            <path d="M9 3.5791c1.3227 0 2.5045.4545 3.4364 1.3455l2.5773-2.5773C13.4636.8055 11.4264 0 9 0 5.4545 0 2.3609 1.1027.8782 2.9364l3.0173 2.3164C4.6155 5.0282 6.6273 3.5791 9 3.5791z" fill="#EA4335"/>
          </g>
        </svg>
      </span>
      <span className="font-medium flex items-center">{children}</span>
    </button>
  );
}; 