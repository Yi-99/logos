import React, { useState, useEffect, useRef } from 'react'
import MicIcon from '@mui/icons-material/Mic'
import CircularProgress from '@mui/material/CircularProgress'
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import chatService from '../services/chat/ChatService'
import { useAuth } from '../contexts/AuthContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface AttachedFile {
	file: File;
	content: string;
	error?: string;
}

const TEXT_FILE_EXTENSIONS = [
	'.txt', '.md', '.csv', '.json', '.xml', '.yaml', '.yml', '.toml',
	'.py', '.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.scss',
	'.java', '.c', '.cpp', '.h', '.go', '.rs', '.rb', '.php',
	'.sh', '.bash', '.zsh', '.sql', '.r', '.swift', '.kt',
	'.log', '.env', '.ini', '.cfg', '.conf',
];

const BINARY_DOC_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (binary docs are larger)
const MAX_TEXT_FILE_SIZE = 512 * 1024; // 512KB for plain text

function getFileCategory(file: File): 'text' | 'pdf' | 'docx' | 'unsupported' {
	const ext = '.' + file.name.split('.').pop()?.toLowerCase();
	if (ext === '.pdf' || file.type === 'application/pdf') return 'pdf';
	if (ext === '.docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
	if (ext === '.doc' || file.type === 'application/msword') return 'docx';
	if (file.type.startsWith('text/')) return 'text';
	if (file.type === 'application/json' || file.type === 'application/xml') return 'text';
	if (TEXT_FILE_EXTENSIONS.includes(ext)) return 'text';
	return 'unsupported';
}

async function extractPdfText(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
	const pages: string[] = [];
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const textContent = await page.getTextContent();
		const pageText = textContent.items
			.map((item: any) => item.str)
			.join(' ');
		pages.push(pageText);
	}
	return pages.join('\n\n');
}

async function extractDocxText(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const result = await mammoth.extractRawText({ arrayBuffer });
	return result.value;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
	const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
	const { user } = useAuth();
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const buildPromptWithAttachments = (userText: string, files: AttachedFile[]): string => {
		if (files.length === 0) return userText;

		const fileContextParts = files
			.filter(f => !f.error)
			.map(f => `--- File: ${f.file.name} ---\n${f.content}\n--- End of ${f.file.name} ---`);

		if (fileContextParts.length === 0) return userText;

		return `${userText}\n\n[Attached files for context]\n${fileContextParts.join('\n\n')}`;
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isLoading) return;
		if (!advisorName) return;

		const savedInput = inputValue;
		const savedFiles = [...attachedFiles];
		const fullPrompt = buildPromptWithAttachments(savedInput, savedFiles);

		setInputValue('');
		setAttachedFiles([]);
		setIsLoading(true);
		onSending?.();

		try {
			const userMessage = {
				role: 'user' as const,
				content: displayContent,
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
					prompt: fullPrompt,
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
			setAttachedFiles(savedFiles);
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

	const handleAttachFile = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const newAttachments: AttachedFile[] = [];

		for (const file of Array.from(files)) {
			const category = getFileCategory(file);

			if (category === 'unsupported') {
				newAttachments.push({ file, content: '', error: 'Unsupported file type' });
				continue;
			}

			const sizeLimit = category === 'text' ? MAX_TEXT_FILE_SIZE : MAX_FILE_SIZE;
			const sizeLimitLabel = category === 'text' ? '512KB' : '5MB';
			if (file.size > sizeLimit) {
				newAttachments.push({ file, content: '', error: `File too large (max ${sizeLimitLabel})` });
				continue;
			}

			try {
				let content: string;
				if (category === 'pdf') {
					content = await extractPdfText(file);
				} else if (category === 'docx') {
					content = await extractDocxText(file);
				} else {
					content = await file.text();
				}

				if (!content.trim()) {
					newAttachments.push({ file, content: '', error: 'No text content found' });
				} else {
					newAttachments.push({ file, content });
				}
			} catch (err) {
				console.error(`Failed to parse ${file.name}:`, err);
				newAttachments.push({ file, content: '', error: 'Failed to read file' });
			}
		}

		setAttachedFiles(prev => [...prev, ...newAttachments]);

		// Reset the input so the same file can be re-selected
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleRemoveFile = (index: number) => {
		setAttachedFiles(prev => prev.filter((_, i) => i !== index));
	};

	useEffect(() => {
		adjustTextareaHeight();
	}, [inputValue]);

	const hasValidAttachments = attachedFiles.some(f => !f.error);

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
