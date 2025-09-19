import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicNoneIcon from '@mui/icons-material/MicNone';
import InputSettingsBar from '../components/InputSettingsBar';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Chatbar from '../components/Chatbar';
import StopIcon from '@mui/icons-material/Stop';
import { WormLoading } from '../components/WormLoading';
import Navbar from '../components/Navbar';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import { Philosopher } from '../constants/types/Philosopher';
import philosopherService from '../services/philosophers/PhilosopherService';
import { toast } from 'react-toastify';
import supabase from '../lib/supabase';
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PhilosopherChatPage: React.FC = () => {
  const { philosopherId } = useParams<{ philosopherId: string }>();
	const [philosopher, setPhilosopher] = useState<Philosopher | null>(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isSpeechToSpeech, setIsSpeechToSpeech] = useState(false);
  const [isTextToText, setIsTextToText] = useState(true);
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

	useEffect(() => {
		let isCancelled = false;
		
		const fetchPhilosopher = async () => {
			if (!philosopherId) {
				toast.error('Philosopher ID is required');
				return;
			}
			
			try {
				const philosopher = await philosopherService.getPhilosopherById(philosopherId);
				if (!isCancelled) {
					setPhilosopher(philosopher);
				}
			} catch (error) {
				if (!isCancelled) {
					console.error('Error fetching philosopher:', error);
					// Optionally show error to user
					toast.error('Failed to load philosopher details');
				}
			}
		}
		
		// Call the async function and handle any unhandled promise rejections
		fetchPhilosopher().catch((error) => {
			if (!isCancelled) {
				console.error('Unhandled error in fetchPhilosopher:', error);
			}
		});
		
		// Cleanup function to prevent state updates if component unmounts
		return () => {
			isCancelled = true;
		};
	}, [philosopherId]);

  const handleMicClick = () => {
    setIsListening(!isListening);
  };

	const handleStopListening = () => {
		setIsListening(false);
		setIsProcessing(true);

		setTimeout(() => {
			setIsProcessing(false);
		}, 2000)
	};

  const handleBackClick = () => {
    navigate('/philosophers');
  };

  const handleHistoryClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    // TODO: Load the selected chat's messages
    console.log('Selected chat:', chatId);
  };


  const handleModeChange = (mode: 'speechToSpeech' | 'textToText') => {
    // Reset all modes to false
    setIsSpeechToSpeech(false);
    setIsTextToText(false);
    setIsSpeechToText(false);
    setIsTextToSpeech(false);
    
    // Set the selected mode to true
    switch (mode) {
      case 'speechToSpeech':
        setIsSpeechToSpeech(true);
        break;
      case 'textToText':
        setIsTextToText(true);
        break;
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    
    // If it's a user message, set AI responding state
    if (message.role === 'user') {
      setIsAIResponding(true);
    } else if (message.role === 'assistant') {
      setIsAIResponding(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <Navbar
        philosopherName={philosopher?.name || ''}
        philosopherSubtitle={philosopher?.subtitle || ''}
        philosopherImage={supabase.storage.from('Portraits').getPublicUrl(philosopher?.image.split('/').pop() || '').data.publicUrl}
        onBackClick={handleBackClick}
        onHistoryClick={handleHistoryClick}
        showHistory={true}
        showProfile={true}
      />

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        onChatSelect={handleChatSelect}
        currentChatId={currentChatId}
      />

      {/* Main Chat Area */}
      <div 
        className="flex-1 relative overflow-hidden"
        onClick={isSidebarOpen ? handleSidebarClose : undefined}
      >
        {/* Chat Messages */}
        <div className="absolute inset-0 p-4 flex flex-col justify-start items-center z-10">
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

        {/* Central Philosopher Image - Fixed position */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center opacity-10">
            {philosopher?.image && 
							<img 
								className="h-full w-full rounded-full" 
								src={supabase.storage.from('Portraits').getPublicUrl(philosopher?.image.split('/').pop() || '').data.publicUrl} 
								alt={philosopher?.name || ''}
							/>
						}
          </div>
        </div>
      </div>

			{/*Listening Indicator */}
			{isListening && (
				<div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
					<div className="flex flex-row items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl">
						<div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
						<span className="text-sm text-gray-600">Listening...</span>
					</div>
				</div>
			)} 

			{/*Processing Indicator */}
			{isProcessing && (
				<div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
					<div className="flex flex-row items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl">
						<WormLoading />
						<span className="text-sm text-gray-600">Processing...</span>
					</div>
				</div>
			)}

			{/* AI Responding Indicator */}
			{isAIResponding && (
				<div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
					<div className="flex flex-row items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl">
						<WormLoading />
						<span className="text-sm text-gray-600">Thinking...</span>
					</div>
				</div>
			)} 

      {/* Bottom Controls */}
      <div className="p-6 pb-0">
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          {isSpeechToSpeech && !isListening ? (<button
            onClick={handleMicClick}
            className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
							transition-all text-white shadow-lg shadow-gray-500 ${isProcessing ? 'bg-black/50 !cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}
            `}
						disabled={isProcessing}
          >
            <MicNoneIcon sx={{ fontSize: 24}} />
          </button>) : (isSpeechToSpeech && <button
            onClick={handleStopListening}
            className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
							transition-all text-white shadow-lg shadow-gray-500 bg-red-500 hover:bg-red-700
            `}
          >
            <StopIcon sx={{ fontSize: 24}} />
          </button>)}

					{isTextToText && <Chatbar philosopherId={philosopherId} onNewMessage={handleNewMessage} />}
        </div>
      </div>

			<div className="flex flex-col items-center justify-center mb-5 gap-3">
				{isSpeechToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<MicNoneIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<VolumeUpIcon sx={{ fontSize: 16 }} />
				</div>}
				{isTextToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
				</div>}
				{isSpeechToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<MicNoneIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
				</div>}
				{isTextToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<VolumeUpIcon sx={{ fontSize: 16 }} />
				</div>}
				<InputSettingsBar 
					isSpeechToSpeech={isSpeechToSpeech}
					isTextToText={isTextToText}
					isSpeechToText={isSpeechToText}
					isTextToSpeech={isTextToSpeech}
					onModeChange={handleModeChange}
				/>
			</div>
    </div>
  );
};

export default PhilosopherChatPage;
