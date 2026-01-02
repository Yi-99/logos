import React, { useState, useEffect, useRef } from 'react'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import SendIcon from '@mui/icons-material/Send'
import chatService from '../services/chat/ChatService'
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { ChatMessage } from '@/pages/PhilosopherChatPage'

interface ChatbarProps {
	advisorName: string;
	messages?: ChatMessage[];
	chatId?: string;
	onNewMessage?: (message: { role: 'user' | 'assistant'; content: string; timestamp: string }) => void;
	onChatCreated?: (chatId: string) => void;
	onListeningChange?: (isListening: boolean) => void;
}

const Chatbar: React.FC<ChatbarProps> = ({
	advisorName,
	messages,
	chatId,
	onNewMessage,
	onChatCreated,
	onListeningChange,
}) => {
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
	const [hasShownMicInfo, setHasShownMicInfo] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const { user } = useAuth();
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	// Cleanup MediaRecorder on unmount
	useEffect(() => {
		return () => {
			if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
				mediaRecorderRef.current.stop();
			}
		};
	}, []);

	// Notify parent when listening state changes
	useEffect(() => {
		onListeningChange?.(isListening);
	}, [isListening, onListeningChange]);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
			});

			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				// Stop all tracks to release the microphone
				stream.getTracks().forEach(track => track.stop());

				const audioBlob = new Blob(audioChunksRef.current, {
					type: mediaRecorder.mimeType
				});

				if (audioBlob.size > 0) {
					setIsTranscribing(true);
					try {
						const result = await chatService.transcribeAudio(audioBlob);
						if (result.transcription) {
							setInputValue(prev => prev ? `${prev} ${result.transcription}` : result.transcription);
						}
					} catch (error) {
						console.error('Transcription error:', error);
					} finally {
						setIsTranscribing(false);
					}
				}
			};

			mediaRecorderRef.current = mediaRecorder;
			mediaRecorder.start();
			setIsListening(true);

			if (!hasShownMicInfo) {
				toast.success('Recording... Click again to stop and transcribe.', {
					position: 'bottom-right',
					autoClose: 2000,
				});
				setHasShownMicInfo(true);
			}
		} catch (error: any) {
			console.error('Error starting recording:', error);
			if (error.name === 'NotAllowedError') {
				toast.error('Microphone access denied. Please allow microphone access in your browser settings.', {
					position: 'bottom-right',
					autoClose: 5000,
				});
			} else {
				toast.error(`Error starting recording: ${error.message}`, {
					position: 'bottom-right',
					autoClose: 5000,
				});
			}
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
			mediaRecorderRef.current.stop();
			setIsListening(false);
		}
	};

	const handleMicClick = () => {
		if (isTranscribing) return;

		if (isListening) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isLoading) return;

		if (!advisorName) return;

		const userMessage = {
			role: 'user' as const,
			content: inputValue,
			timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};

		// Add user message to chat
		onNewMessage?.(userMessage);

		// Clear input and set loading
		setInputValue('');
		setIsLoading(true);

		console.log("prompting philosopher in Chatbar");

		try {
			// Send request to backend
			const response = await chatService.promptAI({
				user_id: user?.id || '',
				prompt: inputValue,
				advisor_name: advisorName,
				chat_id: currentChatId,
				history: messages,
			});

			// Extract the AI response
			if (response && response.length > 0) {
				const chatData = response[0];

				// Update chat ID if this was a new chat
				if (chatData.chat_id && !currentChatId) {
					setCurrentChatId(chatData.chat_id);
					onChatCreated?.(chatData.chat_id);
				}

				if (chatData.content && Array.isArray(chatData.content)) {
					const lastMessage = chatData.content[chatData.content.length - 1];

					if (lastMessage && lastMessage.role === 'assistant') {
						const assistantMessage = {
							role: 'assistant' as const,
							content: lastMessage.content,
							timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
						};
						onNewMessage?.(assistantMessage);
					}
				}
			}
		} catch (error) {
			console.error('Error sending message:', error);
			// You could add error handling here, like showing a toast
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="flex flex-col items-center w-full gap-4">
			{/* Main Chat Input Area */}
			<div className="flex flex-row items-center justify-center w-full max-w-2xl gap-2">
				{/* Text Input Field */}
				<div className="flex-1 relative">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Share your thoughts with the philosopher..."
						className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl outline-none text-gray-700 placeholder-gray-500 text-sm shadow-md overflow-x-auto"
						disabled={isLoading}
					/>
				</div>
				
				{/* Microphone Button */}
				<button
					onClick={handleMicClick}
					className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-md disabled:opacity-50 ${
						isListening
							? 'bg-red-500 text-white border-red-500 animate-pulse'
							: isTranscribing
							? 'bg-yellow-500 text-white border-yellow-500'
							: 'text-gray-700 bg-white border border-gray-300 hover:bg-black hover:text-white hover:shadow-md hover:shadow-gray-700 hover:border-black'
					}`}
					disabled={isLoading || isTranscribing}
					title={isListening ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
				>
					{isListening ? <MicOffIcon sx={{ fontSize: 20 }} /> : <MicIcon sx={{ fontSize: 20 }} />}
				</button>
				
				{/* Send Button */}
				<button 
					onClick={handleSendMessage}
					disabled={isLoading || !inputValue.trim()}
					className="w-12 h-12 text-gray-700 bg-white border border-gray-300 rounded-xl flex items-center justify-center 
					hover:bg-black hover:text-white hover:shadow-md hover:shadow-gray-700 hover:border-black transition-colors shadow-md disabled:opacity-50"
				>
					<SendIcon sx={{ fontSize: 20 }} />
				</button>
			</div>
		</div>
	)
}

export default Chatbar
