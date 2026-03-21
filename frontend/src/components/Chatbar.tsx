import React, { useState, useEffect, useRef } from 'react'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/material/CircularProgress'
import chatService from '../services/chat/ChatService'
import { useAuth } from '../contexts/AuthContext';

interface ChatbarProps {
	advisorName: string;
	chatId?: string;
	onNewMessage?: (message: { role: 'user' | 'assistant'; content: string; timestamp: string }) => void;
	onStreamDelta?: (content: string) => void;
	onRemoveLastMessage?: () => void;
	onChatCreated?: (chatId: string) => void;
	onListeningChange?: (isListening: boolean) => void;
	onSending?: () => void;
	onError?: () => void;
}

const Chatbar: React.FC<ChatbarProps> = ({
	advisorName,
	chatId,
	onNewMessage,
	onStreamDelta,
	onRemoveLastMessage,
	onChatCreated,
	onListeningChange,
	onSending,
	onError,
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

	useEffect(() => {
		return () => {
			if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
				mediaRecorderRef.current.stop();
			}
		};
	}, []);

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
				if (event.data.size > 0) audioChunksRef.current.push(event.data);
			};
			mediaRecorder.onstop = async () => {
				stream.getTracks().forEach(track => track.stop());
				const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
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
				console.log('Recording... Click again to stop and transcribe.');
				setHasShownMicInfo(true);
			}
		} catch (error: any) {
			console.error('Error starting recording:', error);
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
		if (isListening) { stopRecording(); } else { startRecording(); }
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isLoading) return;
		if (!advisorName) return;

		const savedInput = inputValue;
		setInputValue('');
		setIsLoading(true);
		onSending?.();

		try {
			const userMessage = {
				role: 'user' as const,
				content: savedInput,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			};
			onNewMessage?.(userMessage);

			const assistantMessage = {
				role: 'assistant' as const,
				content: '',
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			};
			onNewMessage?.(assistantMessage);

			await chatService.promptAIStream(
				{
					user_id: user?.id || '',
					prompt: savedInput,
					advisor_name: advisorName,
					chat_id: currentChatId,
				},
				{
					onMeta: (data) => {
						if (data.chat_id && !currentChatId) {
							setCurrentChatId(data.chat_id);
							onChatCreated?.(data.chat_id);
						}
					},
					onDelta: (content) => { onStreamDelta?.(content); },
					onDone: () => {},
					onError: (detail) => {
						console.error('Stream error:', detail);
						onRemoveLastMessage?.();
						onError?.();
					},
				}
			);
		} catch (error) {
			console.error('Error sending message:', error);
			onRemoveLastMessage?.();
			setInputValue(savedInput);
			onError?.();
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
		}
	};

	useEffect(() => {
		adjustTextareaHeight();
	}, [inputValue]);

	return (
		<div className="flex flex-col items-center w-full gap-4">
			<div className="flex flex-row items-center justify-center w-full max-w-4xl gap-2">
				<div className="flex-1 relative">
					<textarea
						ref={textareaRef}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Share your thoughts with the philosopher..."
						className="w-full px-4 py-3 mt-1 bg-ink-bg border border-ink-outline-variant rounded-2xl outline-none text-ink-on-surface placeholder-ink-outline text-sm shadow-md resize-none overflow-y-hidden"
						rows={1}
						disabled={isLoading}
					/>
				</div>

				<button
					onClick={handleMicClick}
					className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-md disabled:opacity-50 ${
						isListening
							? 'bg-red-500 text-white border-red-500 animate-pulse'
							: isTranscribing
							? 'bg-ink-bg border border-ink-outline-variant'
							: 'text-ink-on-surface bg-ink-bg border border-ink-outline-variant hover:bg-ink-primary hover:text-ink-on-primary hover:border-ink-primary'
					}`}
					disabled={isLoading || isTranscribing}
					title={isListening ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
				>
					{isListening ? <StopIcon sx={{ fontSize: 20 }} /> : isTranscribing ? <CircularProgress size={20} sx={{ color: 'var(--ink-on-surface)' }} /> : <MicIcon sx={{ fontSize: 20 }} />}
				</button>

				<button
					onClick={handleSendMessage}
					disabled={isLoading || !inputValue.trim()}
					className="w-12 h-12 text-ink-on-surface bg-ink-bg border border-ink-outline-variant rounded-xl flex items-center justify-center
					hover:bg-ink-primary hover:text-ink-on-primary hover:border-ink-primary transition-colors shadow-md disabled:opacity-50"
				>
					<SendIcon sx={{ fontSize: 20 }} />
				</button>
			</div>
		</div>
	)
}

export default Chatbar
