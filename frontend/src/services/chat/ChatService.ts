import axios from 'axios';
import { toast } from 'react-toastify';

export interface History {
	role: string;
	content: string;
}
export interface PromptAIRequest {
	prompt: string;
	advisor_name: string;
	chat_id?: string;
	history?: History[];
}

export interface ChatResponse {
	chat_id: string;
	advisor_name: string;
	content: string;
}

export type PromptAIResponse = ChatResponse[];

const promptAI = async (request: PromptAIRequest) => {
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

const chatService = {
	promptAI,
}

export default chatService;