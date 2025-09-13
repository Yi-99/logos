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
    <div className="relative">
      {/* Fixed Background Image - covers entire viewport */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/school-of-athens.jpg)',
          zIndex: 1,
          transform: `scale(${Math.max(1, 1 - (scrollY - window.innerHeight) * 0.0005)})`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      
      {/* Overlay for text readability */}
      <div className="fixed inset-0 bg-opacity-20" style={{ zIndex: 2 }} />

      {/* Scrollable Content */}
      <div className="relative" style={{ zIndex: 3 }}>
				<div className="h-screen"></div>
        {/* Hero Section */}
        <div className="hero-section min-h-screen flex flex-col items-center justify-center">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-700 mb-6 text-shadow-lg">
              Converse with History's Greatest Philosophers
            </h1>
					</div>
        </div>

				<div className="min-h-screen flex flex-col items-center justify-center">
					<div className="max-w-6xl mx-auto px-6 py-20 text-center">
						<div className="text-xl text-gray-700 text-shadow-lg mb-8 max-w-3xl mx-auto font-bold leading-relaxed backdrop-blur-xs p-4 rounded-4xl">
							Experience profound conversations with ancient and modern briliant minds of philosophers and thinkers. Choose between text, speech-to-text, or speech-to-speech interactions for a truly immersive philosophical journey.
						</div>
					</div>
				</div>

				<div className="min-h-screen flex flex-col items-center justify-center">
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={handleStartJourney}
							className="px-8 py-4 text-xl font-bold text-gray-700 mb-4 p-4 bg-gray-50/50 rounded-lg border border-gray-700 hover:bg-gray-900 hover:text-white transition-colors ease-in-out"
						>
							Start Your Journey
						</button>
					</div>
				</div>
				
        {/* Features Section */}
        <div className="min-h-screen py-20 bg-transparent backdrop-blur-xs flex flex-col items-center justify-center">
					<div className="max-w-6xl mx-auto px-6">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold text-gray-700 mb-4 p-4 bg-gray-50/50 rounded-lg border border-gray-700">
								Powerful Features for Deep Conversations
							</h2>
							<p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
								Multiple interaction modes and authentic philosophical perspectives bring ancient wisdom to modern conversations.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{features.map((feature, index) => (
								<div
									key={index}
									className="bg-gray-50/50 rounded-lg p-8 shadow-sm border border-gray-700 hover:shadow-lg transition-all duration-300 hover:backdrop-blur-xl"
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
    </div>
  );
};

export default HomePage;
