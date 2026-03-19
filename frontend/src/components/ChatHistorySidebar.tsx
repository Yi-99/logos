import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import chatService, { ChatListItem } from '../services/chat/ChatService';
import { useAuth } from '../contexts/AuthContext';
import philosopherService from '@/services/philosophers/PhilosopherService';

interface ChatHistory {
  id: string;
  philosopherName: string;
  philosopherImage: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onChatSelect: (chatId: string) => void;
  currentChatId?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  onChatSelect,
  currentChatId
}) => {
  const { user } = useAuth();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const fetchChatHistories = async () => {
      try {
        const [chats, philosopherData] = await Promise.all([
          chatService.getChats(user.id),
          philosopherService.getAllPhilosophers(),
        ]);

        // Fetch all philosopher image URLs in batch
        const imageKeys = philosopherData.philosophers
          .filter((p) => p.image)
          .map((p) => p.image);
        const batchUrls = await philosopherService.getPhilosopherImageUrls(imageKeys);

        // Map filename-keyed URLs to philosopher name-keyed URLs
        const imageByName: Record<string, string> = {};
        philosopherData.philosophers.forEach((p) => {
          const filename = p.image?.split('/').pop() || p.image;
          if (filename && batchUrls[filename]) {
            imageByName[p.name] = batchUrls[filename];
          }
        });

        const mapped: ChatHistory[] = chats.map((chat) => ({
          id: chat.id,
          philosopherName: chat.advisor_name,
          philosopherImage: imageByName[chat.advisor_name] || '',
          lastMessage: chat.last_message?.content ?? 'No messages yet',
          timestamp: new Date(chat.created_at).toLocaleDateString(),
          messageCount: chat.message_count ?? 0,
        }));

        setChatHistories(mapped);
      } catch (error) {
        console.error('Error fetching chat histories:', error);
      }
    };

    fetchChatHistories();
  }, [isOpen, user?.id]);

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[70] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ChatBubbleOutlineIcon className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-3 hover:bg-gray-100 rounded-md transition-colors"
          >
            <CloseIcon sx={{ fontSize: 20, fontWeight: 'bold' }} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatHistories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ChatBubbleOutlineIcon sx={{ fontSize: 48 }} className="mb-4" />
              <p className="text-center">No chat history yet</p>
              <p className="text-sm text-center">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {chatHistories.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    currentChatId === chat.id
                      ? 'bg-gray-50 border-primary/75'
                      : 'bg-gray-50 hover:border-primary/25 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Philosopher Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br border border-gray-300 flex items-center justify-center flex-shrink-0">
                      {chat.philosopherImage ? (
												<img 
													className="w-8 h-8 rounded-full object-cover" 
													src={chat.philosopherImage} 
													alt={chat.philosopherName}
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.style.display = 'none';
														target.nextElementSibling?.classList.remove('hidden');
													}}
												/>
											) : (
												<div
													className="w-8 h-8 rounded-full object-cover text-xs"
												>
													{chat.philosopherName}
												</div>
											)}
                      <span className="text-sm font-bold text-amber-700 hidden">
                        {chat.philosopherName.charAt(0)}
                      </span>
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.philosopherName}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          <span>{chat.timestamp}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {chat.lastMessage}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {chat.messageCount} messages
                        </span>
                        {currentChatId === chat.id && (
                          <span className="text-xs bg-[#1E2938] text-white px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;
