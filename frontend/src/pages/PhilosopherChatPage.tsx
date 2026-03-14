import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import chatService from '../services/chat/ChatService';
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
import { useAuth } from '../contexts/AuthContext';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PhilosopherChatPage: React.FC = () => {
  let { philosopherId, chatId } = useParams<{ philosopherId?: string; chatId?: string }>();
	const [philosopher, setPhilosopher] = useState<Philosopher | null>(null);
	const [philosopherImageUrl, setPhilosopherImageUrl] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const isNewChat = location.pathname.includes('/new/');
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
	const { user, isLoading: isAuthLoading } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

	useEffect(() => {
		// Wait for auth to finish loading before checking
		if (!isAuthLoading && user?.id == null) {
			navigate('/');
		}
	}, [user?.id, isAuthLoading, navigate]);

	useEffect(() => {
		// Skip fetch if we just created the chat (navigated with skipFetch state)
		if (location.state?.skipFetch) {
			// Clear the state so refreshing the page will fetch
			window.history.replaceState({}, document.title);
			return;
		}

		let isCancelled = false;

		const handleNewChat = async () => {
			if (!philosopherId) {
				toast.error('Philosopher ID is required');
				navigate('/philosophers');
				return;
			}

			try {
				// Fetch philosopher details only - chat will be created on first message
				const philosopherData = await philosopherService.getPhilosopherById(philosopherId);
				if (!isCancelled) {
					setPhilosopher(philosopherData);
					if (philosopherData.image) {
						const url = await philosopherService.getPhilosopherImageUrl(philosopherData.image);
						if (!isCancelled) setPhilosopherImageUrl(url);
					}
				}
			} catch (error) {
				if (!isCancelled) {
					console.error('Error fetching philosopher:', error);
					toast.error('Failed to load philosopher');
					navigate('/philosophers');
				}
			}
		};

		const handleExistingChat = async () => {
			if (!chatId) {
				toast.error('Chat ID is required');
				navigate('/philosophers');
				return;
			}

			try {
				// Fetch chat details
				const chat = await chatService.getChatById(chatId);
				if (!isCancelled) {
					setCurrentChatId(chatId);

					// Fetch philosopher by name
					const allPhilosophers = await philosopherService.getAllPhilosophers();
					const philosopherData = allPhilosophers.philosophers.find(
						p => p.name === chat.advisor_name
					);

					if (philosopherData) {
						setPhilosopher(philosopherData);
						if (philosopherData.image) {
							const url = await philosopherService.getPhilosopherImageUrl(philosopherData.image);
							if (!isCancelled) setPhilosopherImageUrl(url);
						}
					} else {
						throw new Error('Philosopher not found');
					}

					if (chat.content) {
						const content = JSON.parse(chat.content)
						for (const message of content) {
							const newMessage = {
								role: message.role,
								content: message.content,
								timestamp: message.timestamp,
							}
							setMessages(prev => [...prev, newMessage])
						}
					} else {
						throw new Error('Chat content is null or undefined')
					}
				}
			} catch (error) {
				if (!isCancelled) {
					console.error('Error loading chat:', error);
					toast.error('Failed to load chat');
					navigate('/philosophers');
				}
			}
		};

		if (isNewChat) {
			handleNewChat().catch((error) => {
				if (!isCancelled) {
					console.error('Unhandled error in handleNewChat:', error);
				}
			});
		} else {
			handleExistingChat().catch((error) => {
				if (!isCancelled) {
					console.error('Unhandled error in handleExistingChat:', error);
				}
			});
		}

		// Cleanup function to prevent state updates if component unmounts
		return () => {
			isCancelled = true;
		};
	}, [philosopherId, chatId, isNewChat, navigate, location.state?.skipFetch]);

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
    // Navigate to the selected chat
    navigate(`/chat/${chatId}`);
    setIsSidebarOpen(false);
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

  const handleChatCreated = (newChatId: string) => {
    setCurrentChatId(newChatId);
    // Navigate to the new chat URL with state to prevent refetching
    navigate(`/chat/${newChatId}`, { replace: true, state: { skipFetch: true } });
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <Navbar
        philosopherName={philosopher?.name || ''}
        philosopherSubtitle={philosopher?.subtitle || ''}
        philosopherImage={philosopherImageUrl}
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
        <div className="absolute inset-0 p-4 flex flex-col justify-start items-center z-10 overflow-auto">
          <div className="w-full max-w-4xl space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
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
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Central Philosopher Image - Fixed position */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center opacity-10">
            {philosopher?.image && 
							<img 
								className="h-full w-full rounded-full" 
								src={philosopherImageUrl} 
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
						<span className="text-sm text-gray-600 backdrop-blur-xs">Thinking...</span>
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

					{isTextToText && philosopher?.name && (
						<Chatbar
							advisorName={philosopher.name}
							messages={messages}
							chatId={currentChatId}
							onNewMessage={handleNewMessage}
							onChatCreated={handleChatCreated}
							onListeningChange={setIsListening}
						/>
					)}
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
