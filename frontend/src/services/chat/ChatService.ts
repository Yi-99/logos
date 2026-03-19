import axios from 'axios';
import { toast } from 'react-toastify';

export interface History {
	role: string;
	content: string;
}
export interface PromptAIRequest {
	user_id: string;
	prompt: string;
	advisor_name: string;
	chat_id: string | undefined;
}

export interface MessageResponse {
	id: string;
	chat_id: string;
	role: string;
	content: string;
	token_count: number | null;
	metadata: Record<string, any> | null;
	created_at: string;
}

export interface PromptAIResponse {
	chat_id: string;
	advisor_name: string;
	message: MessageResponse;
}

export interface CreateChatRequest {
	user_id: string;
	advisor_name: string;
}

export interface CreateChatResponse {
	id: string;
	advisor_name: string;
	created_at: string;
}

export interface GetChatResponse {
	id: string;
	advisor_name: string;
	created_at: string;
	last_accessed_at: string;
}

export interface ChatListItem {
	id: string;
	user_id: string;
	advisor_name: string;
	message_count: number;
	last_message: { role: string; content: string } | null;
	created_at: string;
	last_accessed_at: string;
}

export interface DeleteChatRequest {
	chatId: string;
}

export interface DeleteChatResponse {
	chatId: string;
}

const getChats = async (userId: string): Promise<ChatListItem[]> => {
	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat`, {
			params: { user_id: userId }
		});
		return response.data;
	} catch (error: any) {
		toast.error('Error fetching chats: ' + (error.response?.data?.detail || error.message), {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

const createChat = async (request: CreateChatRequest): Promise<CreateChatResponse> => {
	console.log('createChat request:', request);
	try {
		const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat`, request);
		const createChatResponse: CreateChatResponse = response.data;

		return createChatResponse;
	} catch (error: any) {
		toast.error('Error creating chat: ' + error.response?.data?.detail || error.message, {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

const deleteChat = async (request: DeleteChatRequest): Promise<DeleteChatResponse> => {
	console.log('deleteChat request:', request);
	try {
		const response = await axios.delete(
			`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat`,
			{ data: request }
		);
		const deleteChatResponse: DeleteChatResponse = response.data;

		return deleteChatResponse;
	} catch (error: any) {
		toast.error('Error deleting chat: ' + error.response?.data?.detail || error.message, {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
}

const getChatById = async (chatId: string): Promise<GetChatResponse> => {
	console.log('getChatById request:', chatId);
	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/${chatId}`);
		const getChatResponse: GetChatResponse = response.data;

		return getChatResponse;
	} catch (error: any) {
		toast.error('Error fetching chat: ' + error.response?.data?.detail || error.message, {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

const getMessages = async (chatId: string, limit?: number): Promise<MessageResponse[]> => {
	try {
		const params: Record<string, any> = {};
		if (limit) params.limit = limit;

		const response = await axios.get(
			`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/${chatId}/messages`,
			{ params }
		);
		return response.data;
	} catch (error: any) {
		toast.error('Error fetching messages: ' + (error.response?.data?.detail || error.message), {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

export interface PromptAIStreamCallbacks {
	onMeta: (data: { chat_id: string; advisor_name: string }) => void;
	onDelta: (content: string) => void;
	onDone: (data: { message: MessageResponse }) => void;
	onError: (detail: string) => void;
}

const promptAIStream = async (request: PromptAIRequest, callbacks: PromptAIStreamCallbacks): Promise<void> => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/prompt`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(request),
		});

		if (!response.ok || !response.body) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		let receivedDone = false;

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			// Keep the last partial line in the buffer
			buffer = lines.pop() || '';

			let currentEvent = '';
			for (const line of lines) {
				if (line.startsWith('event: ')) {
					currentEvent = line.slice(7);
				} else if (line.startsWith('data: ') && currentEvent) {
					const data = JSON.parse(line.slice(6));
					switch (currentEvent) {
						case 'meta':
							callbacks.onMeta(data);
							break;
						case 'delta':
							callbacks.onDelta(data.content);
							break;
						case 'done':
							receivedDone = true;
							callbacks.onDone(data);
							break;
						case 'error':
							callbacks.onError(data.detail);
							return;
					}
					currentEvent = '';
				}
			}
		}

		// Stream ended without a done event — connection was lost
		if (!receivedDone) {
			callbacks.onError('Connection lost — response may be incomplete');
		}
	} catch (error: any) {
		callbacks.onError(error.message || 'Stream failed');
		throw error;
	}
};

export interface TranscribeResponse {
	transcription: string;
}

const transcribeAudio = async (audioBlob: Blob): Promise<TranscribeResponse> => {
	try {
		const formData = new FormData();
		formData.append('audio', audioBlob, 'recording.webm');

		const response = await axios.post(
			`${import.meta.env.VITE_BACKEND_URL}/api/v1/prompt/transcribe`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	} catch (error: any) {
		toast.error('Error transcribing audio: ' + (error.response?.data?.detail || error.message), {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

const promptAI = async (request: PromptAIRequest): Promise<PromptAIResponse> => {
	try {
		const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v0/prompt`, request);
		return response.data;
	} catch (error: any) {
		toast.error('Error: ' + (error.response?.data?.detail || error.message), {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

const chatService = {
	getChats,
	createChat,
	deleteChat,
	getChatById,
	getMessages,
	promptAI,
	promptAIStream,
	transcribeAudio,
}

export default chatService;
