import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StopIcon from '@mui/icons-material/Stop';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const VoiceCallPage: React.FC = () => {
  const { philosopherId } = useParams<{ philosopherId: string }>();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const getPhilosopherInfo = (id: string) => {
    const philosophers: Record<string, { name: string; subtitle: string; image: string }> = {
      socrates: { name: 'Socrates', subtitle: 'Father of Western Philosophy', image: '👨‍🦳' },
      plato: { name: 'Plato', subtitle: 'Student of Socrates', image: '🧙‍♂️' },
      aristotle: { name: 'Aristotle', subtitle: 'The Philosopher', image: '👨‍🎓' },
      confucius: { name: 'Confucius', subtitle: 'Greatest Chinese Philosopher', image: '👴' },
      buddha: { name: 'Buddha', subtitle: 'The Enlightened One', image: '🧘‍♂️' },
      nietzsche: { name: 'Friedrich Nietzsche', subtitle: 'God is Dead', image: '👨‍💼' }
    };
    return philosophers[id] || philosophers.plato;
  };

  const philosopher = getPhilosopherInfo(philosopherId || 'plato');

  const handleBackClick = () => {
    navigate('/');
  };

  const handleEndCall = () => {
    navigate(`/chat/${philosopherId}`);
  };

  const handleMicToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowBackIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <RefreshIcon className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <span className="text-lg">{philosopher.image}</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">{philosopher.name}</h1>
            <p className="text-sm text-gray-600">{philosopher.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Large Philosopher Image */}
        <div className="w-80 h-80 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-8">
          <span className="text-9xl">{philosopher.image}</span>
        </div>

        {/* Listening Status */}
        {isListening && (
          <div className="bg-gray-100 px-4 py-2 rounded-full mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full listening-pulse"></div>
              <span className="text-sm text-gray-700">Listening...</span>
            </div>
          </div>
        )}

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors mb-8"
        >
          <StopIcon className="w-8 h-8 text-white" />
        </button>

        {/* Control Icons */}
        <div className="flex items-center space-x-6 mb-8">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <DownloadIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShareIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <VolumeUpIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center space-x-4">
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded"></div>
            </div>
          </button>
          <button
            onClick={handleMicToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted 
                ? 'bg-gray-200' 
                : 'bg-purple-800 hover:bg-purple-900'
            }`}
          >
            <MicIcon className={`w-5 h-5 ${isMuted ? 'text-gray-600' : 'text-white'}`} />
          </button>
        </div>
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

export default VoiceCallPage;
