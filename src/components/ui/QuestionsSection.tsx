import { HelpCircle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
  fecha: string;
  autor: string;
}

interface QuestionsSectionProps {
  preguntas: Pregunta[];
}

export const QuestionsSection = ({ preguntas }: QuestionsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/20 p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left mb-3 group cursor-pointer hover:bg-purple-50/30 rounded-xl p-2 transition-all duration-300"
        type="button"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
            <HelpCircle size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Preguntas sobre este servicio</h3>
            <p className="text-xs text-gray-500 font-medium">{preguntas.length} preguntas respondidas</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 z-10">
          {isExpanded ? (
            <ChevronUp size={16} className="text-purple-500" />
          ) : (
            <ChevronDown size={16} className="text-purple-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {preguntas.map((pregunta) => (
            <div key={pregunta.id} className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/50 rounded-xl p-3 hover:shadow-md transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle size={12} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-semibold text-gray-800 text-sm">{pregunta.pregunta}</h4>
                    <span className="text-xs text-gray-400 bg-white/60 px-1.5 py-0.5 rounded-lg">{pregunta.fecha}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">{pregunta.respuesta}</p>
                  <p className="text-xs text-purple-500 font-medium">Respondido por {pregunta.autor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 