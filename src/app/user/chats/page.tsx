'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { ChatList } from '@/components/ui/ChatList';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import type { Chat } from '@/lib/api/chat';

export default function ChatsPage() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { chats, messages, loading, sending, sendMessage } = useChat(
    selectedChat?.id
  );

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return false;
    return await sendMessage(message, selectedChat.id);
  };

  if (loading && chats.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="chats">
      <div className="h-[calc(100vh-96px)] min-h-0 p-2 sm:p-3">
        {/* Mobile/Tablet: Show empty state if no chats */}
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md">
              <EmptyState
                icon={<MessageCircle size={32} className="text-purple-500" />}
                title="No tienes conversaciones activas"
                description="Aquí podrás conversar con las personas que acepten tus trabajos para coordinar todos los detalles. Ten tu primer servicio y se habilitará este espacio."
              />
            </div>
          </div>
        ) : (
          <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Chat List - Hide on mobile when chat selected */}
            <aside
              className={`min-h-0 overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 ${
                selectedChat ? 'hidden lg:block' : 'block'
              }`}
            >
              <ChatList
                chats={chats}
                selectedChatId={selectedChat?.id}
                onSelectChat={handleSelectChat}
                currentUserId={user?.id || ''}
              />
            </aside>

            {/* Chat Window - Show placeholder or selected chat */}
            <section
              className={`lg:col-span-2 min-h-0 rounded-2xl bg-white shadow-2xl border border-gray-200 ${
                selectedChat ? 'block' : 'hidden lg:block'
              }`}
            >
              {selectedChat ? (
                <div className="h-full min-h-0">
                  <ChatWindow
                    chat={selectedChat}
                    messages={messages}
                    currentUserId={user?.id || ''}
                    onSendMessage={handleSendMessage}
                    sending={sending}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={48} className="text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Selecciona una conversación
                  </h3>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Elige un chat de la lista para comenzar a conversar
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
