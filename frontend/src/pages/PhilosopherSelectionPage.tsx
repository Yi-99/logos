import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Philosopher {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  dates: string;
  school: string;
  image: string;
  imageClassic?: string;
}

const philosophers: Philosopher[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    subtitle: 'Father of Western Philosophy',
    description: 'Known for the Socratic method and the famous quote "I know that I know nothing"',
    dates: '469-399 BC',
    school: 'Classical Greek',
		image: '/socrates-real.jpg'
  },
  {
    id: 'plato',
    name: 'Plato',
    subtitle: 'Student of Socrates',
    description: 'Founded the Academy in Athens and wrote philosophical dialogues',
    dates: '428-348 BC',
    school: 'Platonism',
		image: '/plato-real.jpg',
		imageClassic: '/plato-athens.jpg',
  },
  {
    id: 'aristotle',
    name: 'Aristotle',
    subtitle: 'The Philosopher',
    description: 'Student of Plato and tutor to Alexander the Great, father of logic',
    dates: '384-322 BC',
    school: 'Aristotelian',
		image: '/aristotle-real.jpg',
		imageClassic: '/aristotle-athens.webp',
  },
  {
    id: 'confucius',
    name: 'Confucius',
    subtitle: 'Greatest Chinese Philosopher',
    description: 'Emphasized morality, justice, kindness, and sincerity',
    dates: '551-479 BC',
    school: 'Confucianism',
		image: '/confucius-real.jpg'
  },
  {
    id: 'buddha',
    name: 'Buddha',
    subtitle: 'The Enlightened One',
    description: 'Founded Buddhism and taught the path to enlightenment',
    dates: '563-483 BC',
    school: 'Buddhism',
		image: '/buddha-handsome.png'
  },
	{
		id: 'jesus',
		name: 'Jesus',
		subtitle: 'The Messiah',
		description: 'Founder of Christianity, Savior of Mankind',
		dates: '0-33 AD',
		school: 'Christianity',
		image: '/jesus.jpg'
	},
	{
		id: 'thomas-aquinas',
		name: 'Thomas Aquinas',
		subtitle: 'The Angelic Doctor',
		description: 'The Angelic Doctor, Known for the Summa Theologica',
		dates: '1225-1274',
		school: 'Thomism',
		image: '/thomas-aquinas-real.jpg',
		imageClassic: '/thomas-aquinas.jpg'
	},
	{
		id: 'descartes',
		name: 'René Descartes',
		subtitle: 'The Father of Modern Philosophy',
		description: 'Father of Modern Philosophy, Known for the Cogito, ergo sum',
		dates: '1596-1650',
		school: 'Cartesianism',
		image: '/descartes-real.jpg'
	},
  {
    id: 'nietzsche',
    name: 'Friedrich Nietzsche',
    subtitle: 'God is Dead',
    description: 'Challenged traditional values and proclaimed the death of God',
    dates: '1844-1900',
    school: 'Existentialism',
		image: '/nietzsche.jpg'
  }
];

const PhilosopherSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePhilosopherSelect = (philosopherId: string) => {
    navigate(`/chat/${philosopherId}`);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Philosophical Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a philosopher to engage in deep conversations about life, wisdom, and the nature of existence. 
            Each brings their unique perspective and teaching style.
          </p>
        </div>

        {/* Philosopher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {philosophers.map((philosopher) => (
            <div
              key={philosopher.id}
              onClick={() => handlePhilosopherSelect(philosopher.id)}
              className="philosopher-card bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 cursor-pointer group"
            >
              {/* Philosopher Image */}
              <div className="w-50 h-50 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="w-42 h-42 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <img src={philosopher.image} alt={philosopher.name} className="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              {/* Philosopher Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {philosopher.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {philosopher.subtitle}
                </p>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {philosopher.description}
                </p>
                <div className="text-xs text-gray-500">
                  {philosopher.dates} • {philosopher.school}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Each conversation is unique and tailored to the philosopher's teachings and personality.
          </p>
        </div>

        {/* Help Button */}
        <div className="fixed bottom-6 right-6">
          <button className="btn-hover w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700">
            <span className="text-lg">?</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherSelectionPage;
