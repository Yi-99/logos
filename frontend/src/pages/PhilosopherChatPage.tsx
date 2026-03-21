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
  }, [messages, isAIResponding]);

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
				navigate('/chats');
				return;
			}

			try {
				// Fetch chat details and messages in parallel
				const [chat, messageList] = await Promise.all([
					chatService.getChatById(chatId),
					chatService.getMessages(chatId),
				]);
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

					// Load messages from the messages endpoint
					if (messageList.length > 0) {
						const loadedMessages: ChatMessage[] = messageList.map(msg => ({
							role: msg.role as 'user' | 'assistant',
							content: msg.content,
							timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
						}));
						setMessages(loadedMessages);
					}
				}
			} catch (error) {
				if (!isCancelled) {
					console.error('Error loading chat:', error);
					toast.error('Failed to load chat');
					navigate('/chats');
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

    // When we receive the empty assistant placeholder, hide the "Thinking..." indicator
    if (message.role === 'assistant') {
      setIsAIResponding(false);
    }
  };

  const handleRemoveLastMessage = () => {
    setMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  const handleStreamDelta = (content: string) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastMsg = updated[updated.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        updated[updated.length - 1] = {
          ...lastMsg,
          content: lastMsg.content + content,
        };
      }
      return updated;
    });
  };

  const handleChatCreated = (newChatId: string) => {
    setCurrentChatId(newChatId);
    // Navigate to the new chat URL with state to prevent refetching
    navigate(`/chat/${newChatId}`, { replace: true, state: { skipFetch: true } });
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#0e0e0e',
        backgroundImage: 'radial-gradient(#222222 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
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
        <section className="absolute inset-0 overflow-y-auto ink-scroll pt-8 pb-56 px-8 md:px-24">
          <div className="max-w-3xl mx-auto space-y-16">
            {messages.map((message, index) => (
              <div
                key={index}
                className="chat-message"
              >
                {message.role === 'assistant' ? (
                  /* AI Message - editorial style, no bubble */
                  <div className="flex flex-col space-y-4 max-w-2xl">
                    <div className="flex items-center space-x-2 opacity-50">
                      <span className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#acabaa]">
                        {philosopher?.name || 'Archive Intelligence'}
                      </span>
                      <span className="text-[10px] font-['Inter'] text-[#767575]">
                        • {message.timestamp}
                      </span>
                    </div>
                    <div className="text-lg md:text-xl leading-relaxed text-[#acabaa] italic font-['Newsreader']">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  /* User Message - right-aligned, subtle container */
                  <div className="flex flex-col items-end space-y-4 ml-auto max-w-2xl">
                    <div className="flex items-center space-x-2 opacity-50">
                      <span className="text-[10px] font-['Inter'] text-[#767575]">
                        {message.timestamp} •
                      </span>
                      <span className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#c6c6c6]">
                        You
                      </span>
                    </div>
                    <div className="text-lg leading-relaxed text-[#e7e5e5] bg-[#131313] p-6 rounded-xl border border-[#484848]/5 font-['Newsreader']">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI Responding Indicator - inline with messages */}
            {isAIResponding && (
              <div className="flex flex-col space-y-4 max-w-2xl">
                <div className="flex items-center space-x-2 opacity-50">
                  <span className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#acabaa]">
                    {philosopher?.name || 'Archive Intelligence'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <WormLoading />
                  <span className="text-sm font-['Inter'] text-[#767575] italic">Contemplating...</span>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </section>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-row items-center gap-2 bg-[#191a1a] border border-[#484848]/20 px-4 py-2 rounded-xl">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-[#acabaa] font-['Inter']">Listening...</span>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-row items-center gap-2 bg-[#191a1a] border border-[#484848]/20 px-4 py-2 rounded-xl">
            <WormLoading />
            <span className="text-sm text-[#acabaa] font-['Inter']">Processing...</span>
          </div>
        </div>
      )}

      {/* Bottom Input Area with gradient fade */}
      <div className="relative z-10">
        <div className="absolute bottom-full left-0 right-0 h-32 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/95 to-transparent pointer-events-none"></div>

        <div className="px-6 pt-4 pb-2" style={{ backgroundColor: '#0e0e0e' }}>
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6 mb-3">
            {isSpeechToSpeech && !isListening ? (<button
              onClick={handleMicClick}
              className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
                transition-all text-[#0e0e0e] shadow-lg shadow-black/30 ${isProcessing ? 'bg-[#c6c6c6]/50 !cursor-not-allowed' : 'bg-[#c6c6c6] hover:bg-[#e7e5e5]'}
              `}
              disabled={isProcessing}
            >
              <MicNoneIcon sx={{ fontSize: 24}} />
            </button>) : (isSpeechToSpeech && <button
              onClick={handleStopListening}
              className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
                transition-all text-white shadow-lg shadow-black/30 bg-red-500 hover:bg-red-700
              `}
            >
              <StopIcon sx={{ fontSize: 24}} />
            </button>)}

            {isTextToText && philosopher?.name && (
              <Chatbar
                advisorName={philosopher.name}
                chatId={currentChatId}
                onNewMessage={handleNewMessage}
                onStreamDelta={handleStreamDelta}
                onRemoveLastMessage={handleRemoveLastMessage}
                onChatCreated={handleChatCreated}
                onListeningChange={setIsListening}
                onSending={() => setIsAIResponding(true)}
                onError={() => setIsAIResponding(false)}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pb-5 gap-3" style={{ backgroundColor: '#0e0e0e' }}>
          {isSpeechToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-[#767575]">
            <MicNoneIcon sx={{ fontSize: 16 }} />
            <ArrowRightAltIcon sx={{ fontSize: 16 }} />
            <VolumeUpIcon sx={{ fontSize: 16 }} />
          </div>}
          {isTextToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-[#767575]">
            <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
            <ArrowRightAltIcon sx={{ fontSize: 16 }} />
            <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
          </div>}
          {isSpeechToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-[#767575]">
            <MicNoneIcon sx={{ fontSize: 16 }} />
            <ArrowRightAltIcon sx={{ fontSize: 16 }} />
            <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
          </div>}
          {isTextToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-[#767575]">
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
    </div>
  );
};

export default PhilosopherChatPage;
