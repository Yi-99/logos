import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import chatService from '../services/chat/ChatService';
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

        const imageKeys = philosopherData.philosophers
          .filter((p) => p.image)
          .map((p) => p.image);
        const batchUrls = await philosopherService.getPhilosopherImageUrls(imageKeys);

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
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-ink-bg border-r border-ink-outline-variant/15 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-outline-variant/15">
          <div className="flex flex-col space-y-1">
            <span className="text-lg font-serif text-ink-on-surface italic">Recent Dialogues</span>
            <span className="font-sans text-2xs uppercase tracking-widest text-ink-on-surface-variant">Chat Archive</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-3 text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface rounded-md transition-colors duration-500"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto ink-scroll">
          {chatHistories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-ink-outline">
              <ChatBubbleOutlineIcon sx={{ fontSize: 48 }} className="mb-4 opacity-30" />
              <p className="text-center font-serif italic text-ink-on-surface-variant">No dialogues yet</p>
              <p className="text-sm text-center font-sans text-ink-outline mt-1">Begin a conversation to see it here</p>
            </div>
          ) : (
            <nav className="p-4 space-y-2">
              {chatHistories.map((chat) => (
                <a
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer transition-all duration-400 ${
                    currentChatId === chat.id
                      ? 'text-ink-on-surface bg-ink-surface'
                      : 'text-ink-on-surface-variant hover:bg-ink-surface-low hover:text-ink-on-surface'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-ink-surface flex-shrink-0">
                    {chat.philosopherImage ? (
                      <img
                        className="w-full h-full object-cover"
                        src={chat.philosopherImage}
                        alt={chat.philosopherName}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-xs font-medium text-ink-on-surface-variant flex items-center justify-center w-full h-full ${chat.philosopherImage ? 'hidden' : ''}`}>
                      {chat.philosopherName.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-serif truncate">
                        {chat.philosopherName}
                      </span>
                      {currentChatId === chat.id && (
                        <span className="text-[9px] font-sans uppercase tracking-wider text-ink-on-primary bg-ink-primary px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-sans text-ink-outline line-clamp-2">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xs font-sans text-ink-outline-variant">
                        {chat.timestamp}
                      </span>
                      <span className="text-2xs font-sans text-ink-outline-variant">
                        {chat.messageCount} entries
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;
