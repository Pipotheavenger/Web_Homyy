'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import type { Chat, ChatMessage } from '@/lib/api/chat';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWindowProps {
  chat: Chat;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => Promise<boolean>;
  sending: boolean;
}

export const ChatWindow = ({ chat, messages, currentUserId, onSendMessage, sending }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = chat.client_id === currentUserId ? chat.worker : chat.client;

  // Scroll to bottom cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input cuando se abre el chat
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const success = await onSendMessage(newMessage);
    
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return format(date, 'HH:mm', { locale: es });
      } else {
        return format(date, 'dd/MM HH:mm', { locale: es });
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            {otherUser?.profile_picture_url ? (
              <img
                src={otherUser.profile_picture_url}
                alt={otherUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {otherUser?.name || 'Usuario'}
            </h3>
            {chat.booking?.service?.title && (
              <p className="text-xs text-purple-600 truncate">
                📋 {chat.booking.service.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
              <Send size={28} className="text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Inicia la conversación
            </h3>
            <p className="text-xs text-gray-600">
              Escribe un mensaje para comenzar a chatear
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isOwn
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {message.sender?.profile_picture_url ? (
                        <img
                          src={message.sender.profile_picture_url}
                          alt={message.sender.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-8" />
                  )}

                  {/* Message bubble */}
                  <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-900 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{message.message}</p>
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
