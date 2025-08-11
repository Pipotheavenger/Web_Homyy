interface SuccessMessageProps {
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
}

export const SuccessMessage = ({ title, message, buttonText, buttonHref }: SuccessMessageProps) => {
  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center animate-fade-in-up">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
      </div>
      <a
        href={buttonHref}
        className="inline-block w-full py-3 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
      >
        {buttonText}
      </a>
    </div>
  );
}; 