import SendIcon from '@mui/icons-material/Send';
import { useState, useEffect } from 'react';
import chatService, { PromptAIResponse } from '../services/chat/ChatService';

interface ChatMessage {
	role: string;
	content: string;
}

const Chatbox = () => {
	const [prompt, setPrompt] = useState<string>('');
	const [chatContent, setChatContent] = useState<ChatMessage[] | null>(null);

	useEffect(() => {
		setChatContent([
			{
				role: 'user',
				content: "What is the meaning of baptism for the dead?",
			},
			{
				role: 'assistant',
				content: `Verily I say unto thee, neither John nor I spake one word concerning the baptizing of the dead.  My commission was this:  
					"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost" (Matthew 28:19), 
					and to baptize with water unto repentance (Mark 1:4; Luke 3:3).  There is but one baptism, even that into Christ's death and resurrection 
					(Romans 6:3–4; Ephesians 4:5). Paul indeed maketh mention that some at Corinth were "baptized for the dead" (1 Corinthians 15:29), yet he 
					giveth no commandment for the Church to follow that custom, and he plainly showeth that, apart from faith in the resurrection, such a rite 
					profiteth nothing.  If any man bring another doctrine, let him be accursed (Galatians 1:8). Trust not in inventions of men, but search the 
					Scriptures, "for in them ye think ye have eternal life: and they are they which testify of me" (John 5:39).  God of mercy and truth needeth 
					no human device to vindicate His justice; His word standeth sure, and he that believeth and is baptized shall be saved (Mark 16:16).`,
			},
		]);
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(prompt);

		const promptResult = await chatService.promptAI({
			prompt,
			advisorName: 'Jesus Christ',
		});

		const chatMessages = JSON.parse(promptResult.content);
		console.log(chatMessages);

		setChatContent(chatMessages);
		setPrompt('');
	}

	return (
		<div className="flex flex-col gap-3 w-full h-screen justify-between items-stretch">
			<div className="flex flex-col justify-center items-start gap-10">
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
					className="w-full h-20 border-2 border-gray-300 rounded-lg p-2 resize-none focus:outline-gray-500" 
					placeholder="Type your message here..."
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
				>
				</textarea>
				<div className="flex flex-col items-center justify-center">
					<button 
						className="border-2 border-gray-300 rounded-lg p-1 cursor-pointer transition-colors hover:border-gray-500"
						onClick={handleSubmit}
					>
						<SendIcon className="" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default Chatbox