import { useState } from 'react';

interface CertificationsInputProps {
  certifications: string[];
  onChange: (certifications: string[]) => void;
  error?: string;
}

export const CertificationsInput = ({ certifications, onChange, error }: CertificationsInputProps) => {
  const [newCertification, setNewCertification] = useState('');

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      onChange([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCertification();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Certificaciones (opcional)
      </label>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Agregar certificación"
          value={newCertification}
          onChange={(e) => setNewCertification(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6] focus:border-[#743fc6] outline-none"
        />
        <button
          type="button"
          onClick={addCertification}
          disabled={!newCertification.trim()}
          className="px-4 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#8a5fd1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Agregar
        </button>
      </div>

      {certifications.length > 0 && (
        <div className="space-y-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{cert}</span>
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs font-medium">{error}</p>
      )}
    </div>
  );
};







