import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicNoneIcon from '@mui/icons-material/MicNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { getPhilosopherInfo } from '../constants/philosophers';
import InputSettingsBar from '../components/InputSettingsBar';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Chatbar from '../components/Chatbar';
import HistoryIcon from '@mui/icons-material/History';
import StopIcon from '@mui/icons-material/Stop';
import { WormLoading } from '../components/WormLoading';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PhilosopherChatPage: React.FC = () => {
  const { philosopherId } = useParams<{ philosopherId: string }>();
  const navigate = useNavigate();
  const philosopher = getPhilosopherInfo(philosopherId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'user',
      content: 'How can wisdom guide us through difficult decisions?',
      timestamp: '01:14 AM'
    },
    {
      role: 'assistant',
      content: 'As I\'ve written, the unexamined life is not worth living. How does this apply to your question?',
      timestamp: '01:14 AM'
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechToSpeech, setIsSpeechToSpeech] = useState(true);
  const [isTextToText, setIsTextToText] = useState(false);
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMicClick = () => {
    setIsListening(!isListening);
  };

	const handleStopListening = () => {
		setIsListening(false);
		setIsProcessing(true);

		setTimeout(() => {
			setIsProcessing(false);
		}, 2000)
	};

  const handleBackClick = () => {
    navigate('/');
  };

  const handleVoiceCall = () => {
    navigate(`/voice/${philosopherId}`);
  };

  const handleModeChange = (mode: 'speechToSpeech' | 'textToText') => {
    // Reset all modes to false
    setIsSpeechToSpeech(false);
    setIsTextToText(false);
    setIsSpeechToText(false);
    setIsTextToSpeech(false);
    
    // Set the selected mode to true
    switch (mode) {
      case 'speechToSpeech':
        setIsSpeechToSpeech(true);
        break;
      case 'textToText':
        setIsTextToText(true);
        break;
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <HistoryIcon sx={{ fontSize: 20 }} />
          </button>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <img className="h-full w-full rounded-full" src={philosopher?.image} alt={philosopher?.name}/>
          </div>
          <div>
            <h1 className="font-bold text-lg">{philosopher?.name}</h1>
            <p className="text-sm text-gray-600">{philosopher?.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Chat Messages */}
        <div className="absolute inset-0 p-4 flex flex-col justify-center items-center">
          <div className="w-full max-w-4xl space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Philosopher Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center opacity-15">
            <img className="h-full w-full rounded-full" src={philosopher?.image} alt={philosopher?.name}/>
          </div>
        </div>
      </div>

			{/*Listening Indicator */}
			{isListening && (
				<div className="absolute bottom-52 left-1/2 transform -translate-x-1/2">
					<div className="flex flex-row items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl">
						<div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
						<span className="text-sm text-gray-600">Listening...</span>
					</div>
				</div>
			)} 

			{/*Processing Indicator */}
			{isProcessing && (
				<div className="absolute bottom-52 left-1/2 transform -translate-x-1/2">
					<div className="flex flex-row items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl">
						<WormLoading />
						<span className="text-sm text-gray-600">Processing...</span>
					</div>
				</div>
			)} 

      {/* Bottom Controls */}
      <div className="p-6 pb-0">
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          {isSpeechToSpeech && !isListening ? (<button
            onClick={handleMicClick}
            className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
							transition-all text-white shadow-lg shadow-gray-500 ${isProcessing ? 'bg-black/50 !cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}
            `}
						disabled={isProcessing}
          >
            <MicNoneIcon sx={{ fontSize: 24}} />
          </button>) : (isSpeechToSpeech && <button
            onClick={handleStopListening}
            className={`w-16 h-16 cursor-pointer rounded-full flex items-center justify-center
							transition-all text-white shadow-lg shadow-gray-500 bg-red-500 hover:bg-red-700
            `}
          >
            <StopIcon sx={{ fontSize: 24}} />
          </button>)}

					{isTextToText && <Chatbar></Chatbar>}
        </div>
      </div>

			<div className="flex flex-col items-center justify-center mb-5 gap-3">
				{isSpeechToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<MicNoneIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<VolumeUpIcon sx={{ fontSize: 16 }} />
				</div>}
				{isTextToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
				</div>}
				{isSpeechToText && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<MicNoneIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
				</div>}
				{isTextToSpeech && <div className="w-full flex flex-row items-center justify-center gap-1 text-gray-500">
					<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
					<ArrowRightAltIcon sx={{ fontSize: 16 }} />
					<VolumeUpIcon sx={{ fontSize: 16 }} />
				</div>}
				<InputSettingsBar 
					isSpeechToSpeech={isSpeechToSpeech}
					isTextToText={isTextToText}
					isSpeechToText={isSpeechToText}
					isTextToSpeech={isTextToSpeech}
					onModeChange={handleModeChange}
				/>
			</div>

      {/* Help Button */}
      <div className="absolute bottom-6 right-6">
        <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
          <HelpOutlineIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PhilosopherChatPage;
