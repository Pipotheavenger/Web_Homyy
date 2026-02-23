'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, ArrowLeft, Paperclip, Image as ImageIcon, Camera, X } from 'lucide-react';
import type { Chat, ChatMessage } from '@/lib/api/chat';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { uploadImage } from '@/lib/utils/storage';

interface ChatWindowProps {
  chat: Chat;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string, type?: 'text' | 'image' | 'document') => Promise<boolean>;
  sending: boolean;
  onBack?: () => void; // ✅ Función para volver a la lista de chats
}

export const ChatWindow = ({ chat, messages, currentUserId, onSendMessage, sending, onBack }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null); // <- ref del contenedor scrolleable
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const otherUser = chat.client_id === currentUserId ? chat.worker : chat.client;

  // Scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight; // más fiable que scrollIntoView en listas largas
  }, [messages]);

  // Focus en input cuando se abre el chat
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const success = await onSendMessage(newMessage, 'text');
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    setUploading(true);

    try {
      const publicUrl = await uploadImage(file);
      await onSendMessage(publicUrl, 'image');
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
      // Limpiar input
      if (e.target) e.target.value = '';
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      return isToday ? format(date, 'HH:mm', { locale: es }) : format(date, 'dd/MM HH:mm', { locale: es });
    } catch {
      return '';
    }
  };

  return (
    // 👇 importante: min-h-0 para permitir overflow del hijo
    <div className="h-full min-h-0 flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md ring-2 ring-white flex-shrink-0">
            {otherUser?.profile_picture_url ? (
              <img src={otherUser.profile_picture_url} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {otherUser?.name || 'Usuario'}
            </h3>
            {chat.booking?.service?.title && (
              <p className="text-xs text-purple-600 truncate">📋 {chat.booking.service.title}</p>
            )}
          </div>
          {/* ✅ Botón de retroceso para móviles (solo visible en pantallas < 1024px) */}
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg flex-shrink-0"
              aria-label="Volver a la lista de chats"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Wrapper de mensajes */}
      {/* 👇 importante: este padre también con min-h-0 */}
      <div className="flex-1 min-h-0 relative">
        {/* Área scrolleable */}
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overscroll-contain scroll-smooth"
        >
          <div className="px-4 py-3 space-y-2.5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
                  <Send size={28} className="text-purple-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Inicia la conversación</h3>
                <p className="text-xs text-gray-600">Escribe un mensaje para comenzar a chatear</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === currentUserId;
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {showAvatar ? (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ${
                            isOwn ? 'bg-gradient-to-br from-purple-500 to-pink-500 ring-purple-200' : 'bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-200'
                          }`}
                        >
                          {message.sender?.profile_picture_url ? (
                            <img src={message.sender.profile_picture_url} alt={message.sender.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">
                              {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}

                      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-3 py-2 rounded-2xl shadow-sm ${
                            isOwn
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                              : 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200'
                          }`}
                        >
                          {message.message_type === 'image' ? (
                            <a href={message.message} target="_blank" rel="noopener noreferrer" className="block">
                              <img 
                                src={message.message} 
                                alt="Imagen enviada" 
                                className="max-w-full rounded-lg max-h-64 object-cover"
                                onLoad={() => scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight}
                              />
                            </a>
                          ) : (
                            <p className="text-sm break-words">{message.message}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-0.5 px-1">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
        
        {/* Loading overlay when uploading */}
        {uploading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-sm font-medium text-gray-700">Subiendo imagen...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        {/* Attach Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-full left-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-w-[160px] animate-in slide-in-from-bottom-2 fade-in duration-200 z-20">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <ImageIcon size={18} />
              </div>
              Anexar imagen
            </button>
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <Camera size={18} />
              </div>
              Tomar foto
            </button>
          </div>
        )}

        {/* Hidden Inputs */}
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <input 
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
        />

        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-purple-50/30 flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2 items-end">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={sending || uploading}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm border ${
                showAttachMenu 
                  ? 'bg-purple-100 text-purple-600 border-purple-200 rotate-45' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {showAttachMenu ? <X size={20} /> : <Paperclip size={20} />}
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={sending || uploading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-100 shadow-sm pr-10"
              />
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim() || sending || uploading}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
