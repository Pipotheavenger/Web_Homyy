'use client';

import { useState, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { ChatList } from '@/components/ui/ChatList';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import type { Chat } from '@/lib/api/chat';

// ✅ OPTIMIZACIÓN: Skeleton de carga para ChatWindow
const ChatWindowSkeleton = () => (
  <div className="h-full flex flex-col bg-white animate-pulse">
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
    <div className="flex-1 p-4 space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ✅ OPTIMIZACIÓN: Skeleton de carga para ChatList
const ChatListSkeleton = () => (
  <div className="flex flex-col h-full overflow-hidden animate-pulse">
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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

  // ✅ OPTIMIZACIÓN: Mostrar skeleton solo si no hay chats y está cargando
  // Si ya hay chats, mostrarlos inmediatamente aunque siga cargando
  if (loading && chats.length === 0) {
    return (
      <Layout>
        <div className="h-[calc(100vh-96px)] min-h-0 p-2 sm:p-3">
          <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <aside className="min-h-0 overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200">
              <ChatListSkeleton />
            </aside>
            <section className="lg:col-span-2 min-h-0 rounded-2xl bg-white shadow-2xl border border-gray-200">
              <ChatWindowSkeleton />
            </section>
          </div>
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
                <Suspense fallback={<ChatWindowSkeleton />}>
                  <div className="h-full min-h-0">
                    <ChatWindow
                      chat={selectedChat}
                      messages={messages}
                      currentUserId={user?.id || ''}
                      onSendMessage={handleSendMessage}
                      sending={sending}
                      onBack={() => setSelectedChat(null)} // ✅ Volver a la lista de chats
                    />
                  </div>
                </Suspense>
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
