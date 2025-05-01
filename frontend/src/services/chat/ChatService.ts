import axios from 'axios';
import { toast } from 'react-toastify';

export interface PromptAIRequest {
	prompt: string;
	advisorName: string;
}

export interface PromptAIResponse {
	chatId: string;
	advisorName: string;
	content: string;
}

const promptAI = async (request: PromptAIRequest): Promise<PromptAIResponse> => {
	try {
		const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/prompt`, request);
		console.log(response.data);

		const promptAIResponse: PromptAIResponse = response.data;

		console.log(promptAIResponse);

		toast.success('Success!', {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});

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