import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import chatService, { ChatListItem } from '../services/chat/ChatService';
import philosopherService from '../services/philosophers/PhilosopherService';
import { Philosopher } from '../constants/types/Philosopher';
import { useAuth } from '../contexts/AuthContext';
import { WormLoading } from '../components/WormLoading';
import { toast } from 'react-toastify';

const ChatListPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [chats, setChats] = useState<ChatListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!isAuthLoading && !user?.id) {
			navigate('/');
		}
	}, [user?.id, isAuthLoading, navigate]);

	useEffect(() => {
		const fetchData = async () => {
			if (!user?.id) return;

			try {
				// Fetch chats and philosophers in parallel
				const [chatList, philosopherData] = await Promise.all([
					chatService.getChats(user.id),
					philosopherService.getAllPhilosophers()
				]);

				setChats(chatList);

				// Fetch S3 image URLs for all philosophers
				const urls: Record<string, string> = {};
				await Promise.all(
					philosopherData.philosophers.map(async (p: Philosopher) => {
						if (p.image) {
							urls[p.name] = await philosopherService.getPhilosopherImageUrl(p.image);
						}
					})
				);
				setImageUrls(urls);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (user?.id) {
			fetchData();
		}
	}, [user?.id]);

	const getPhilosopherImage = (advisorName: string): string => {
		return imageUrls[advisorName] || '';
	};

	const handleChatSelect = (chatId: string) => {
		navigate(`/chat/${chatId}`);
	};

	const handleNewChat = () => {
		navigate('/philosophers/');
	};

	const handleChatDelete = async (e: React.MouseEvent, chatId: string) => {
		e.stopPropagation(); // Prevent navigation to chat

		try {
			await chatService.deleteChat({ chatId });
			// Remove from local state
			setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
			toast.success('Chat deleted successfully', {
				position: 'bottom-right',
				autoClose: 3000,
			});
		} catch (error) {
			console.error('Error deleting chat:', error);
		}
	};

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} min ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		return date.toLocaleDateString();
	};

	const getLastMessage = (chat: ChatListItem): string => {
		if (chat.last_message) {
			const content = chat.last_message.content;
			return content.substring(0, 100) + (content.length > 100 ? '...' : '');
		}
		return 'No messages yet';
	};

	const getMessageCount = (chat: ChatListItem): number => {
		return chat.message_count ?? 0;
	};

	// Calculate chat statistics
	const stats = useMemo(() => {
		const totalChats = chats.length;
		const totalMessages = chats.reduce((acc, chat) => acc + getMessageCount(chat), 0);

		// Count chats per philosopher
		const philosopherCounts: Record<string, number> = {};
		chats.forEach(chat => {
			philosopherCounts[chat.advisor_name] = (philosopherCounts[chat.advisor_name] || 0) + 1;
		});

		// Find most active philosopher
		let mostActivePhilosopher = 'None';
		let maxChats = 0;
		Object.entries(philosopherCounts).forEach(([name, count]) => {
			if (count > maxChats) {
				mostActivePhilosopher = name;
				maxChats = count;
			}
		});

		// Calculate average messages per chat
		const avgMessagesPerChat = totalChats > 0 ? Math.round(totalMessages / totalChats) : 0;

		// Get unique philosophers count
		const uniquePhilosophers = Object.keys(philosopherCounts).length;

		return {
			totalChats,
			totalMessages,
			mostActivePhilosopher,
			mostActiveChats: maxChats,
			avgMessagesPerChat,
			uniquePhilosophers,
			philosopherCounts,
		};
	}, [chats]);

	if (isAuthLoading || isLoading) {
		return (
			<div className="h-screen bg-white flex items-center justify-center">
				<WormLoading />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Floating Stats Island */}
			<div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg border border-gray-200 rounded-2xl px-4 py-3">
				<div className="flex flex-col items-center space-y-2">
					<BarChartIcon sx={{ fontSize: 24 }} className="text-gray-600" />
					<span className="text-xs font-medium text-gray-600">Stats</span>

					<div className="w-8 h-0.5 bg-gray-200 rounded-full" />
					
					<span className="text-lg font-bold text-gray-800">{stats.totalChats}</span>
					<span className="text-xs text-gray-500">chats</span>

					<div className="w-8 h-0.5 bg-gray-200 rounded-full" />

					<span className="text-lg font-bold text-gray-800">{stats.uniquePhilosophers}</span>
					<span className="text-xs text-gray-500">advisors</span>
				</div>
			</div>

			{/* Header */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<ChatBubbleOutlineIcon className="text-gray-600" />
							<h1 className="text-xl font-semibold text-gray-800">Your Conversations</h1>
						</div>
					</div>
					<button
						onClick={handleNewChat}
						className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
					>
						<AddIcon sx={{ fontSize: 20 }} />
					</button>
				</div>
			</div>

			{/* Chat List */} 
			<div className="max-w-4xl mx-auto px-4 py-6">
				{chats.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-gray-500">
						<ChatBubbleOutlineIcon sx={{ fontSize: 64 }} className="mb-4 text-gray-300" />
						<p className="text-lg font-medium mb-2">No conversations yet</p>
						<p className="text-sm text-center mb-6">Start a conversation with a philosopher to see it here</p>
						<button
							onClick={handleNewChat}
							className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
						>
							<AddIcon sx={{ fontSize: 20 }} />
							<span>Start a Conversation</span>
						</button>
					</div>
				) : (
					<div className="space-y-3">
						{chats.map((chat) => (
							<div
								key={chat.id}
								onClick={() => handleChatSelect(chat.id)}
								className="bg-white p-4 rounded-xl cursor-pointer transition-all border border-gray-200 hover:border-gray-300 hover:shadow-md"
							>
								<div className="flex items-start space-x-4">
									{/* Philosopher Avatar */}
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
										{getPhilosopherImage(chat.advisor_name) ? (
											<img
												className="h-full w-full rounded-full object-cover"
												src={getPhilosopherImage(chat.advisor_name)}
												alt={chat.advisor_name}
											/>
										) : (
											<span className="text-lg font-bold text-amber-700">
												{chat.advisor_name?.charAt(0) || '?'}
											</span>
										)}
									</div>

									{/* Chat Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<h3 className="text-base font-medium text-gray-900">
												{chat.advisor_name}
											</h3>

											<div className="flex flex-row items-center justify-center gap-2">
												<div className="flex items-center space-x-1 text-xs text-gray-500">
													<AccessTimeIcon sx={{ fontSize: 14 }} />
													<span>{formatTimestamp(chat.created_at)}</span>
												</div>
												<button
													className="flex items-center justify-center border border-gray-200 rounded-md p-2 hover:border-red-300 hover:bg-red-50 transition-colors"
													onClick={(e) => handleChatDelete(e, chat.id)}
												>
													<DeleteIcon sx={{ fontSize: 18 }} className="text-gray-400 hover:text-red-500" />
												</button>
											</div>
										</div>

										<p className="text-sm text-gray-600 line-clamp-2 mb-2">
											{getLastMessage(chat)}
										</p>

										<div className="flex items-center">
											<span className="text-xs text-gray-500">
												{getMessageCount(chat)} messages
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatListPage;
