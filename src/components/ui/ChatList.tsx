'use client';

import { MessageCircle, Clock } from 'lucide-react';
import type { Chat } from '@/lib/api/chat';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chat: Chat) => void;
  currentUserId: string;
}

export const ChatList = ({ chats, selectedChatId, onSelectChat, currentUserId }: ChatListProps) => {
  const getOtherUser = (chat: Chat) => {
    return chat.client_id === currentUserId ? chat.worker : chat.client;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch {
      return '';
    }
  };

  const getMessagePreview = (message: string | null) => {
    if (!message) return 'Sin mensajes aún';
    // Verificar si es una URL de imagen de Supabase (heurística simple)
    if (message.includes('/storage/v1/object/public/images/')) {
      return '📷 Imagen';
    }
    return message;
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle size={40} className="text-purple-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No tienes conversaciones
        </h3>
        <p className="text-sm text-gray-600">
          Las conversaciones se crearán automáticamente cuando contrates un servicio
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle size={22} className="text-purple-600" />
          Mensajes
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {chats.length} {chats.length === 1 ? 'conversación' : 'conversaciones'}
        </p>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {chats.map((chat) => {
          const otherUser = getOtherUser(chat);
          const isSelected = chat.id === selectedChatId;
          const hasUnread = (chat.unread_count ?? 0) > 0;

          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 text-left ${
                isSelected ? 'bg-purple-50 border-l-4 border-l-purple-600 shadow-inner' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
                  {otherUser?.profile_picture_url ? (
                    <img
                      src={otherUser.profile_picture_url}
                      alt={otherUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-sm truncate ${
                      hasUnread ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {otherUser?.name || 'Usuario'}
                    </h3>
                    {chat.last_message_at && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock size={10} />
                        <span>{formatTime(chat.last_message_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Service title */}
                  {chat.booking?.service?.title && (
                    <p className="text-[10px] text-purple-600 mb-1 truncate">
                      📋 {chat.booking.service.title}
                    </p>
                  )}

                  {/* Last message */}
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${
                      hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                    }`}>
                      {getMessagePreview(chat.last_message)}
                    </p>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
