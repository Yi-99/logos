import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PhilosopherChatPage: React.FC = () => {
  const { philosopherId } = useParams<{ philosopherId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'user',
      content: 'How can wisdom guide us through difficult decisions?',
      timestamp: '01:14 AM'
    },
    {
      role: 'assistant',
      content: 'As I\'ve written, the unexamined life is not worth living. How does this apply to your question?',
      timestamp: '01:14 AM'
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getPhilosopherInfo = (id: string) => {
    const philosophers: Record<string, { name: string; subtitle: string; image: string }> = {
      socrates: { name: 'Socrates', subtitle: 'Father of Western Philosophy', image: '👨‍🦳' },
      plato: { name: 'Plato', subtitle: 'Student of Socrates', image: '🧙‍♂️' },
      aristotle: { name: 'Aristotle', subtitle: 'The Philosopher', image: '👨‍🎓' },
      confucius: { name: 'Confucius', subtitle: 'Greatest Chinese Philosopher', image: '👴' },
      buddha: { name: 'Buddha', subtitle: 'The Enlightened One', image: '🧘‍♂️' },
      nietzsche: { name: 'Friedrich Nietzsche', subtitle: 'God is Dead', image: '👨‍💼' }
    };
    return philosophers[id] || philosophers.plato;
  };

  const philosopher = getPhilosopherInfo(philosopherId || 'plato');

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setIsProcessing(true);
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        setIsListening(false);
      }, 2000);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleVoiceCall = () => {
    navigate(`/voice/${philosopherId}`);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowBackIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <RefreshIcon className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <span className="text-lg">{philosopher.image}</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">{philosopher.name}</h1>
            <p className="text-sm text-gray-600">{philosopher.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Chat Messages */}
        <div className="absolute inset-0 p-4 flex flex-col justify-center items-center">
          <div className="w-full max-w-4xl space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Philosopher Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center opacity-20">
            <span className="text-8xl">{philosopher.image}</span>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm text-gray-600">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-6 border-t border-gray-100">
        {/* Suggested Question */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 px-4 py-2 rounded-full">
            <span className="text-sm text-gray-700">
              "How can wisdom guide us through difficult decisions?"
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <DownloadIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShareIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleMicClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <MicIcon className="w-8 h-8 text-white" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <VolumeUpIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={handleVoiceCall}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded"></div>
            </div>
          </button>
          <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
            <MicIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Help Button */}
      <div className="absolute bottom-6 right-6">
        <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
          <HelpOutlineIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PhilosopherChatPage;
