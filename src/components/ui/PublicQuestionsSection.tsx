import React, { useState } from 'react';
import { MessageCircle, Send, User, Clock, MessageSquare } from 'lucide-react';

interface Pregunta {
  id: string;
  question: string;
  answer?: string;
  answered_at?: string;
  created_at: string;
  user: {
    name: string;
    profile_picture_url?: string;
  };
}

interface PublicQuestionsSectionProps {
  preguntas: Pregunta[];
  onAnswerQuestion: (questionId: string, answer: string) => Promise<boolean>;
  loading?: boolean;
}

export const PublicQuestionsSection: React.FC<PublicQuestionsSectionProps> = ({
  preguntas,
  onAnswerQuestion,
  loading = false
}) => {
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  const handleAnswerQuestion = async (questionId: string) => {
    if (!answerText.trim() || submittingAnswer) return;

    setSubmittingAnswer(true);
    const success = await onAnswerQuestion(questionId, answerText);
    
    if (success) {
      setAnswerText('');
      setAnsweringQuestion(null);
    }
    
    setSubmittingAnswer(false);
  };

  const startAnswering = (questionId: string) => {
    setAnsweringQuestion(questionId);
    setAnswerText('');
  };

  const cancelAnswering = () => {
    setAnsweringQuestion(null);
    setAnswerText('');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Preguntas Públicas</h3>
          <p className="text-sm text-gray-600">Responde las preguntas de los profesionales</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando preguntas...</p>
          </div>
        ) : preguntas.length > 0 ? (
          preguntas.map((pregunta) => (
            <div key={pregunta.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
              {/* Pregunta */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    {pregunta.user.profile_picture_url ? (
                      <img 
                        src={pregunta.user.profile_picture_url} 
                        alt={pregunta.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {pregunta.user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{pregunta.user.name}</span>
                      <span className="text-xs text-gray-500">preguntó</span>
                    </div>
                    <p className="text-gray-700 text-sm">{pregunta.question}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 ml-2">{getTimeAgo(pregunta.created_at)}</span>
              </div>

              {/* Respuesta existente */}
              {pregunta.answer ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 ml-11">
                  <div className="flex items-center space-x-2 mb-2">
                    <User size={14} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">Tu respuesta</span>
                    {pregunta.answered_at && (
                      <span className="text-xs text-green-600">• {getTimeAgo(pregunta.answered_at)}</span>
                    )}
                  </div>
                  <p className="text-green-700 text-sm">{pregunta.answer}</p>
                </div>
              ) : (
                <div className="ml-11">
                  {answeringQuestion === pregunta.id ? (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Escribe tu respuesta..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && !submittingAnswer && handleAnswerQuestion(pregunta.id)}
                          disabled={submittingAnswer}
                        />
                        <button
                          onClick={() => handleAnswerQuestion(pregunta.id)}
                          disabled={!answerText.trim() || submittingAnswer}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm"
                        >
                          {submittingAnswer ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Send size={14} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={cancelAnswering}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock size={14} className="text-yellow-600" />
                          <span className="text-sm text-yellow-700">Esperando tu respuesta</span>
                        </div>
                        <button
                          onClick={() => startAnswering(pregunta.id)}
                          className="text-xs px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                        >
                          Responder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay preguntas aún</p>
            <p className="text-sm text-gray-500 mt-1">Los profesionales pueden hacer preguntas públicas sobre tu servicio</p>
          </div>
        )}
      </div>
    </div>
  );
};
