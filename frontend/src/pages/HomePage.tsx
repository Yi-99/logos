import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PeopleIcon from '@mui/icons-material/People';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartJourney = () => {
    navigate('/philosophers');
  };

  const handleLearnMore = () => {
    // TODO: Implement learn more functionality
    console.log('Learn more clicked');
  };

  const features = [
    {
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 32 }} />,
      title: 'Text Conversations',
      description: 'Engage in deep philosophical discussions through text with history\'s greatest thinkers.'
    },
    {
      icon: <MicIcon sx={{ fontSize: 32 }} />,
      title: 'Speech-to-Text',
      description: 'Speak naturally and have your words converted to text for seamless interaction.'
    },
    {
      icon: <VolumeUpIcon sx={{ fontSize: 32 }} />,
      title: 'Speech-to-Speech',
      description: 'Experience natural voice conversations with AI philosophers who respond in their unique voices.'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      title: 'Multiple Philosophers',
      description: 'Choose from Socrates, Plato, Aristotle, Confucius, Buddha, and Nietzsche.'
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
      title: 'Authentic Responses',
      description: 'Each philosopher responds with their unique perspective and historical context.'
    },
    {
      icon: <FlashOnIcon sx={{ fontSize: 32 }} />,
      title: 'Instant Wisdom',
      description: 'Get immediate insights and engage in real-time philosophical discourse.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="hero-section">
        {/* Wanderer Background */}
        <div 
          className="hero-background absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/wanderer.jpg)',
            opacity: Math.max(0, 1 - scrollY * 0.0015),
            filter: `brightness(${Math.max(0.3, 1 - scrollY * 0.0008)})`
          }}
        />
        
        {/* Overlay for text readability */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-20"
          style={{
            opacity: Math.max(0, 0.2 - scrollY * 0.0003)
          }}
        />

        <div 
          className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center"
          style={{
            transform: `translateY(${-scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.002)
          }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Converse with History's Greatest Philosophers
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience profound conversations with Socrates, Plato, Aristotle, and more. Choose between text, speech-to-text, or speech-to-speech interactions for a truly immersive philosophical journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartJourney}
              className="px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </button>
            <button
              onClick={handleLearnMore}
              className="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Deep Conversations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple interaction modes and authentic philosophical perspectives bring ancient wisdom to modern conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-gray-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
