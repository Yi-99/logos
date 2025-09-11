import MicIcon from '@mui/icons-material/Mic'
import SendIcon from '@mui/icons-material/Send'

const Chatbar = () => {
	return (
		<div className="flex flex-col items-center w-full gap-4">
			{/* Main Chat Input Area */}
			<div className="flex flex-row items-center justify-center w-full max-w-2xl gap-2">
				{/* Text Input Field */}
				<div className="flex-1 relative">
					<input
						type="text"
						placeholder="Share your thoughts with the philosopher..."
						className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl outline-none text-gray-700 placeholder-gray-500 text-sm shadow-md"
					/>
				</div>
				
				{/* Microphone Button */}
				<button className="w-12 h-12 text-gray-700 bg-white border border-gray-300 rounded-xl flex items-center justify-center 
				hover:bg-black hover:text-white hover:shadow-md hover:shadow-gray-700 hover:border-black transition-colors shadow-md">
					<MicIcon sx={{ fontSize: 20 }} />
				</button>
				
				{/* Send Button */}
				<button className="w-12 h-12 text-gray-700 bg-white border border-gray-300 rounded-xl flex items-center justify-center 
					hover:bg-black hover:text-white hover:shadow-md hover:shadow-gray-700 hover:border-black transition-colors shadow-md">
					<SendIcon sx={{ fontSize: 20 }} />
				</button>
			</div>
		</div>
	)
}

export default Chatbar
