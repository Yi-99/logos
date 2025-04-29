import axios from 'axios';

export const ChatService = () => {
	const promptAI = async (request: PromptAIRequest) => {
		try {
			const response = await axios.get('/api/v1/prompt')
		}
	}
}

interface PromptAIRequest {
	message: string;
	counselor: string;
}