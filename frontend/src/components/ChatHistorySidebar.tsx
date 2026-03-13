import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
  // Mock data - in a real app, this would come from props or API
  const chatHistories: ChatHistory[] = [
    {
      id: '1',
      philosopherName: 'Plato',
      philosopherImage: '/plato-real.jpg',
      lastMessage: 'As I\'ve written, the unexamined life is not worth living...',
      timestamp: '2 hours ago',
      messageCount: 12
    },
    {
      id: '2',
      philosopherName: 'Socrates',
      philosopherImage: '/socrates-real.jpg',
      lastMessage: 'I know that I know nothing. What do you think about wisdom?',
      timestamp: '1 day ago',
      messageCount: 8
    },
    {
      id: '3',
      philosopherName: 'Aristotle',
      philosopherImage: '/aristotle-real.webp',
      lastMessage: 'The unexamined life is not worth living, but the examined life...',
      timestamp: '3 days ago',
      messageCount: 15
    },
    {
      id: '4',
      philosopherName: 'Confucius',
      philosopherImage: '/confucius-real.jpg',
      lastMessage: 'By three methods we may learn wisdom...',
      timestamp: '1 week ago',
      messageCount: 6
    },
    {
      id: '5',
      philosopherName: 'Buddha',
      philosopherImage: '/buddha-handsome.png',
      lastMessage: 'The mind is everything. What you think you become.',
      timestamp: '2 weeks ago',
      messageCount: 20
    }
  ];

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
            className="py-2 px-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
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
                  onClick={() => {
                    onChatSelect(chat.id);
                    onClose();
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    currentChatId === chat.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Philosopher Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
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
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-gray-200 py-2 px-4 text-sm text-gray-600 hover:bg-black hover:text-white rounded-lg transition-colors">
            Clear All History
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;
