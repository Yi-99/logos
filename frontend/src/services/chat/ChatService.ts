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
	history?: History[];
}

export interface ChatResponse {
	chat_id: string;
	advisor_name: string;
	content: string;
}

export type PromptAIResponse = ChatResponse[];

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
	content?: string;
}

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

const promptAI = async (request: PromptAIRequest) => {
	console.log('promptAI request:', request);
	try {
		const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/prompt`, request);
		const promptAIResponse: PromptAIResponse = response.data;

		return promptAIResponse;
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
	createChat,
	getChatById,
	promptAI,
	transcribeAudio,
}

export default chatService;