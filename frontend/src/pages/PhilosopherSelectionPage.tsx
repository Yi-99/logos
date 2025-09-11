import React from 'react';
import { useNavigate } from 'react-router-dom';
import { philosophers } from '../constants/philosophers';

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
            Choose Your Philosopher
          </h1>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            Select a philosopher to engage in deep conversations about life, wisdom, and the nature of existence. 
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
								<p className="text-sm text-gray-700 bg-gray-100 p-2 rounded-lg mb-3 leading-relaxed">
									{philosopher.quote}
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
