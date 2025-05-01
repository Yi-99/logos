import SendIcon from '@mui/icons-material/Send';
import { useState, useRef } from 'react';
import chatService, { PromptAIResponse } from '../services/chat/ChatService';
import CircularProgress from '@mui/material/CircularProgress';

export interface ChatMessage {
	role: string;
	content: string;
}

const ChatPage = () => {
	const [prompt, setPrompt] = useState<string>('');
	const [chatContent, setChatContent] = useState<ChatMessage[] | null>(null);
	const [chatId, setChatId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		console.log(prompt);

		// save user message to chat content
		setChatContent((prevMessages) => {
			if (prevMessages) {
				return [...prevMessages, { role: 'user', content: prompt }];
			} else {
				return [{ role: 'user', content: prompt }];
			}
		})

		scrollToBottom();

		const lastPrompt = prompt; // cache the last prompt
		setPrompt('');

		try {
			console.log('Chat ID:', chatId);
			const promptResult: PromptAIResponse = await chatService.promptAI({
				prompt,
				advisor_name: 'Jesus Christ',
				chat_id: chatId ?? undefined,
				history: chatContent ? chatContent : undefined,
			});
			console.log('Prompt Result:', promptResult);

			chatId === null ? setChatId(promptResult[0].chat_id) : "";

			const chatMessages = JSON.parse(promptResult[0].content);
			console.log('Chat Messages:', chatMessages);
	
			// save ai advisor's message to chat content
			setChatContent((prevMessagees) => {
				if (prevMessagees) {
					return [...prevMessagees, { role: 'assistant', content: chatMessages[chatMessages.length-1].content }];
				} else {
					return chatMessages;
				}
			});

			scrollToBottom();
			setIsLoading(false);
		} catch (error) {
			console.error('Error submitting prompt:', error);

			setChatContent((prevMessages) => {
				return [...prevMessages!.splice(0, prevMessages!.length - 1)];
			})

			setPrompt(lastPrompt); // restore the last prompt
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-3 w-full h-screen justify-between items-stretch overflow-y-hidden">
			<div id="chat-container" className="flex flex-col justify-center items-start gap-10 overflow-y-auto">
				{chatContent && chatContent.map((message, index) => {
					if (index % 2 === 0) {
						return (
							<div key={index} className="flex flex-col max-w-[90%] h-fit mr-auto border-2 border-gray-100 rounded-lg p-5">
								<p className="text-gray-700">{message.content}</p>
							</div>
						);
					} else {
						return (
							<div key={index} className="flex flex-col max-w-[90%] h-fit ml-auto border-2 border-gray-100 rounded-lg p-5 bg-gray-200">
								<p className="text-gray-700">{message.content}</p>
							</div>
						);
					}
				})}
			</div>
			<div className="flex flex-row justify-center items-center w-full gap-3">
				<textarea 
					className="w-full h-30 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-gray-500" 
					placeholder="Type your message here..."
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
				>
				</textarea>
				<div className="flex flex-col items-center justify-center">
					{
						!isLoading ? (
							<button 
								className="border-2 border-gray-300 rounded-lg p-2 cursor-pointer transition-colors hover:border-gray-500"
								onClick={handleSubmit}
							>
								<SendIcon className="" />
							</button>
						) : (
							<button 
								className="border-2 border-gray-300 rounded-lg p-2 cursor-pointer transition-colors hover:border-gray-500"
								disabled
							>
								<CircularProgress size={24} />
							</button>
						)
					}
					
				</div>
			</div>
		</div>
	)
}

export default ChatPage