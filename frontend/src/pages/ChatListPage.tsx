import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import chatService, { ChatListItem } from '../services/chat/ChatService';
import philosopherService from '../services/philosophers/PhilosopherService';
import { Philosopher } from '../constants/types/Philosopher';
import { useAuth } from '../contexts/AuthContext';
import { WormLoading } from '../components/WormLoading';
import Navbar from '../components/Navbar';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const ChatListPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [chats, setChats] = useState<ChatListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [, setImageUrls] = useState<Record<string, string>>({});
	const [currentPage, setCurrentPage] = useState(1);
	const chatsPerPage = 6;

	useEffect(() => {
		if (!isAuthLoading && !user?.id) {
			navigate('/');
		}
	}, [user?.id, isAuthLoading, navigate]);

	useEffect(() => {
		const fetchData = async () => {
			if (!user?.id) return;

			try {
				const [chatList, philosopherData] = await Promise.all([
					chatService.getChats(user.id),
					philosopherService.getAllPhilosophers()
				]);

				setChats(chatList);

				const imageKeys = philosopherData.philosophers
					.filter((p: Philosopher) => p.image)
					.map((p: Philosopher) => p.image);
				const batchUrls = await philosopherService.getPhilosopherImageUrls(imageKeys);

				const urls: Record<string, string> = {};
				philosopherData.philosophers.forEach((p: Philosopher) => {
					const filename = p.image?.split('/').pop() || p.image;
					if (filename && batchUrls[filename]) {
						urls[p.name] = batchUrls[filename];
					}
				});
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

	const handleChatSelect = (chatId: string) => {
		navigate(`/chat/${chatId}`);
	};

	const handleNewChat = () => {
		navigate('/philosophers/');
	};

	const formatDate = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	};

	const formatShortDate = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
	};

	const getLastMessage = (chat: ChatListItem): string => {
		if (chat.last_message) {
			const content = chat.last_message.content;
			return content.substring(0, 150) + (content.length > 150 ? '...' : '');
		}
		return 'No messages yet';
	};

	const getMessageCount = (chat: ChatListItem): number => {
		return chat.message_count ?? 0;
	};

	const stats = useMemo(() => {
		const totalChats = chats.length;
		const totalMessages = chats.reduce((acc, chat) => acc + getMessageCount(chat), 0);
		const philosopherCounts: Record<string, number> = {};
		chats.forEach(chat => {
			philosopherCounts[chat.advisor_name] = (philosopherCounts[chat.advisor_name] || 0) + 1;
		});
		const uniquePhilosophers = Object.keys(philosopherCounts).length;

		return { totalChats, totalMessages, uniquePhilosophers };
	}, [chats]);

	const totalPages = Math.max(1, Math.ceil(chats.length / chatsPerPage));
	const paginatedChats = chats.slice(
		(currentPage - 1) * chatsPerPage,
		currentPage * chatsPerPage
	);

	if (isAuthLoading || isLoading) {
		return (
			<div className="h-screen ink-dot-grid flex items-center justify-center">
				<WormLoading />
			</div>
		);
	}

	return (
		<div className="min-h-screen ink-dot-grid flex flex-col">
			<Navbar
				title="who"
				titleHref="/"
				subtitle="Previous Inquiries"
				showChatsButton={false}
				fixed={true}
			/>

			{/* Content Area */}
			<section className="flex-1 px-10 py-8 md:py-12 md:px-20 lg:px-32 max-w-7xl mx-auto w-full pt-20 md:pt-24">
				{/* Hero Header (Asymmetric Layout) */}
				<div className="mb-10 md:mb-20 grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-8 items-end">
					<div className="md:col-span-4">
						<span className="font-sans text-xs tracking-[0.2em] text-ink-on-surface-variant uppercase mb-4 block">
							The Private Collection
						</span>
						<h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-light tracking-tighter text-ink-on-surface leading-tight">
							Scholarly <br /> <span className="italic text-ink-primary">Perspectives</span>
						</h2>
					</div>
					<div className="md:col-span-3 text-ink-on-surface-variant font-serif text-base md:text-lg italic leading-relaxed md:pb-2">
						"The unexamined life is not worth living." A digital repository of your philosophical explorations through time.
					</div>
				</div>

				{chats.length === 0 ? (
					/* Empty state */
					<div className="flex flex-col items-center justify-center py-20">
						<ChatBubbleOutlineIcon sx={{ fontSize: 64 }} className="text-ink-outline-variant mb-6 opacity-30" />
						<p className="text-2xl font-serif italic text-ink-on-surface-variant mb-2">No inquiries yet</p>
						<p className="text-sm font-sans text-ink-outline mb-8">Begin a dialogue with a philosopher to see it here</p>
						<button
							onClick={handleNewChat}
							className="px-8 py-4 bg-ink-primary text-ink-on-primary font-serif italic text-lg rounded-md hover:opacity-90 transition-opacity active:scale-[0.98]"
						>
							Begin New Inquiry
						</button>
					</div>
				) : (
					/* Inquiries Grid (Bento Style) */
					<div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
						{paginatedChats.map((chat, index) => {
							const isWide = index % 3 === 0;
							const colSpan = isWide ? 'md:col-span-8' : 'md:col-span-4';
							const bgClass = index % 4 === 0
								? 'bg-ink-surface hover:bg-ink-surface-high'
								: index % 4 === 1
								? 'bg-ink-surface-low hover:bg-ink-surface border border-ink-outline-variant/5'
								: index % 4 === 2
								? 'bg-ink-surface hover:bg-ink-surface-high border border-ink-outline-variant/5'
								: 'bg-ink-surface-high hover:bg-ink-surface-highest';

							return (
								<div
									key={chat.id}
									onClick={() => handleChatSelect(chat.id)}
									className={`${colSpan} ${bgClass} transition-all duration-500 cursor-pointer p-5 md:p-8 relative overflow-hidden group`}
								>
									<div className="flex justify-between items-start mb-4 md:mb-6 gap-3 md:gap-4">
										<div>
											<h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-ink-on-surface mb-1">
												{chat.advisor_name}
											</h3>
											<p className="font-sans text-xs text-ink-on-surface-variant tracking-widest uppercase italic">
												{getMessageCount(chat)} exchanges
											</p>
										</div>
										<div className="flex items-center gap-3">
											<time className="font-sans text-xs text-ink-on-surface-variant">
												{isWide ? formatDate(chat.created_at) : formatShortDate(chat.created_at)}
											</time>
											{/* <button
												className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 transition-all duration-300"
												onClick={(e) => handleChatDelete(e, chat.id)}
												title="Delete"
											>
												<DeleteIcon sx={{ fontSize: 16 }} className="text-ink-outline hover:text-red-500" />
											</button> */}
										</div>
									</div>

									<p className={`font-serif text-ink-on-surface-variant leading-relaxed mb-8 group-hover:text-ink-on-surface transition-colors duration-500 ${
										isWide ? 'text-xl max-w-2xl' : 'text-lg line-clamp-3'
									}`}>
										"{getLastMessage(chat)}"
									</p>

									<div className="flex items-center gap-4">
										<AutoStoriesIcon sx={{ fontSize: 24 }} />
										<div className="h-px flex-1 bg-ink-outline-variant/20"></div>
										<span className="font-sans text-xs uppercase tracking-widest text-ink-primary hover:text-ink-on-surface transition-colors">
											Continue dialogue
										</span>
									</div>
								</div>
							);
						})}

						{/* New Inquiry Card */}
						<div
							onClick={handleNewChat}
							className="md:col-span-4 bg-ink-surface-low hover:bg-ink-surface border border-dashed border-ink-outline-variant/20 hover:border-ink-primary/30 transition-all duration-500 cursor-pointer p-8 flex flex-col items-center justify-center min-h-[200px] group"
						>
							<AddIcon sx={{ fontSize: 48 }} />
							<span className="font-sans text-xs tracking-widest text-ink-on-surface-variant uppercase group-hover:text-ink-on-surface transition-colors">
								New Inquiry
							</span>
						</div>

						{/* Pagination / Footer */}
						<div className="md:col-span-12 mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between border-t border-ink-outline-variant/10 pt-6 md:pt-8">
							<p className="font-sans text-2xs md:text-xs tracking-[0.15em] md:tracking-[0.25em] text-ink-on-surface-variant uppercase mb-4 md:mb-0 text-center md:text-left">
								Page {String(currentPage).padStart(2, '0')} of {String(totalPages).padStart(2, '0')} — {stats.totalChats} dialogue{stats.totalChats !== 1 ? 's' : ''} <span className="hidden sm:inline">— {stats.uniquePhilosophers} philosopher{stats.uniquePhilosophers !== 1 ? 's' : ''} — {stats.totalMessages} exchange{stats.totalMessages !== 1 ? 's' : ''}</span>
							</p>
							<div className="flex gap-8">
								{currentPage > 1 && <button
									onClick={() => setCurrentPage(p => p - 1)}
									className="font-sans text-xs tracking-widest uppercase text-ink-on-surface-variant hover:text-ink-primary transition-colors"
								>
									Previous
								</button>}
								{currentPage < totalPages && <button
									onClick={() => setCurrentPage(p => p + 1)}
									className="font-sans text-xs tracking-widest uppercase text-ink-on-surface-variant hover:text-ink-primary transition-colors"
								>
									Next
								</button>}
							</div>
						</div>
					</div>
				)}
			</section>

			{/* Footer */}
			<footer className="mt-auto py-8 px-6 text-center opacity-30">
				<p className="font-sans text-2xs tracking-[0.5em] uppercase text-ink-on-surface-variant">
					who: Logos Project
				</p>
			</footer>
		</div>
	);
};

export default ChatListPage;
