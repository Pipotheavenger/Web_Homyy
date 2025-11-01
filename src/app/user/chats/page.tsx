'use client';

import { useState } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
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
  const { chats, messages, loading, sending, sendMessage, loadMessages } = useChat(
    selectedChat?.id
  );

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return false;
    return await sendMessage(message, selectedChat.id);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Mobile/Tablet: Show empty state if no chats */}
          {chats.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <EmptyState
                icon={<MessageCircle size={32} className="text-purple-500" />}
                title="No tienes conversaciones activas"
                description="Aquí podrás conversar con las personas que acepten tus trabajos para coordinar todos los detalles. Ten tu primer servicio y se habilitará este espacio."
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-12rem)]">
                {/* Chat List - Hide on mobile when chat selected */}
                <div
                  className={`lg:col-span-1 border-r border-gray-200 ${
                    selectedChat ? 'hidden lg:block' : 'block'
                  }`}
                >
                  <ChatList
                    chats={chats}
                    selectedChatId={selectedChat?.id}
                    onSelectChat={handleSelectChat}
                    currentUserId={user?.id || ''}
                  />
                </div>

                {/* Chat Window - Show placeholder or selected chat */}
                <div
                  className={`lg:col-span-2 ${
                    selectedChat ? 'block' : 'hidden lg:block'
                  }`}
                >
                  {selectedChat ? (
                    <div className="h-full flex flex-col">
                      {/* Mobile back button */}
                      <button
                        onClick={handleBackToList}
                        className="lg:hidden flex items-center gap-2 p-3 border-b border-gray-200 bg-white hover:bg-gray-50"
                      >
                        <ArrowLeft size={20} className="text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Volver a chats
                        </span>
                      </button>

                      <ChatWindow
                        chat={selectedChat}
                        messages={messages}
                        currentUserId={user?.id || ''}
                        onSendMessage={handleSendMessage}
                        sending={sending}
                      />
                    </div>
                  ) : (
                    <div className="hidden lg:flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
