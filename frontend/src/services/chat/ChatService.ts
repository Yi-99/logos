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

const promptAI = async (request: PromptAIRequest): Promise<PromptAIResponse> => {
	console.log('promptAI request:', request);
	try {
		const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/prompt`, request);
		return response.data;
	} catch (error: any) {
		toast.error('Error: ' + error.response?.data?.message || error.message, {
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

const chatService = {
	getChats,
	createChat,
	deleteChat,
	getChatById,
	getMessages,
	promptAI,
	transcribeAudio,
}

export default chatService;
