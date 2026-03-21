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
    <div className="h-screen ink-dot-grid flex flex-col">
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
        <div className="absolute inset-0 overflow-y-auto ink-scroll px-6 md:px-24 py-12 z-10">
          <div className="max-w-3xl mx-auto space-y-16">
            {messages.map((message, index) => (
              <div key={index} className="chat-message">
                {message.role === 'user' ? (
                  /* User Message */
                  <div className="flex flex-col items-end space-y-4 ml-auto max-w-2xl">
                    <div className="flex items-center space-x-2 opacity-50">
                      <span className="text-2xs font-sans text-ink-outline">{message.timestamp} •</span>
                      <span className="text-2xs font-sans uppercase tracking-widest text-ink-primary">You</span>
                    </div>
                    <div className="text-lg leading-relaxed text-ink-on-surface bg-ink-surface-low p-6 rounded-xl border border-ink-outline-variant/5 font-serif">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant Message */
                  <div className="flex flex-col space-y-4 max-w-2xl">
                    <div className="flex items-center space-x-2 opacity-50">
                      <span className="text-2xs font-sans uppercase tracking-widest text-ink-on-surface-variant">
                        {philosopher?.name || 'Archive Intelligence'}
                      </span>
                      <span className="text-2xs font-sans text-ink-outline">• {message.timestamp}</span>
                    </div>
                    <div className="text-lg md:text-xl leading-relaxed text-ink-on-surface-variant italic font-serif">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Central Philosopher Image - Fixed position */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-64 h-64 rounded-full bg-ink-surface flex items-center justify-center opacity-10">
            {philosopherImageUrl &&
              <img
                className="h-full w-full rounded-full"
                src={philosopherImageUrl}
                alt={philosopher?.name || ''}
              />
            }
          </div>
        </div>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-row items-center gap-2 bg-ink-bg border border-ink-outline-variant/20 px-4 py-2 rounded-xl">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-ink-on-surface-variant">Listening...</span>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-row items-center gap-2 bg-ink-bg border border-ink-outline-variant/20 px-4 py-2 rounded-xl">
            <WormLoading />
            <span className="text-sm text-ink-on-surface-variant">Processing...</span>
          </div>
        </div>
      )}

      {/* AI Responding Indicator */}
      {isAIResponding && (
        <div className="fixed bottom-48 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-row items-center gap-2 bg-ink-bg border border-ink-outline-variant/20 px-4 py-2 rounded-xl">
            <WormLoading />
            <span className="text-sm text-ink-on-surface-variant">Thinking...</span>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-center space-x-6 mb-4">
          {isSpeechToSpeech && !isListening ? (<button
            onClick={handleMicClick}
            className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
              transition-all text-ink-on-primary shadow-lg ${isProcessing ? 'bg-ink-primary/50 !cursor-not-allowed' : 'bg-ink-primary hover:opacity-80'}
            `}
            disabled={isProcessing}
          >
            <MicNoneIcon sx={{ fontSize: 24}} />
          </button>) : (isSpeechToSpeech && <button
            onClick={handleStopListening}
            className="w-16 h-16 cursor-pointer rounded-full flex items-center justify-center transition-all text-white shadow-lg bg-red-500 hover:bg-red-700"
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

      <div className="flex flex-col items-center justify-center mb-5 gap-3">
        {isSpeechToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-ink-on-surface-variant">
          <MicNoneIcon sx={{ fontSize: 16 }} />
          <ArrowRightAltIcon sx={{ fontSize: 16 }} />
          <VolumeUpIcon sx={{ fontSize: 16 }} />
        </div>}
        {isTextToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-ink-on-surface-variant">
          <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
          <ArrowRightAltIcon sx={{ fontSize: 16 }} />
          <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
        </div>}
        {isSpeechToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-ink-on-surface-variant">
          <MicNoneIcon sx={{ fontSize: 16 }} />
          <ArrowRightAltIcon sx={{ fontSize: 16 }} />
          <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
        </div>}
        {isTextToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-ink-on-surface-variant">
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
