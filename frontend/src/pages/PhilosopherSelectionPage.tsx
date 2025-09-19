import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Philosopher } from '@/constants/types/Philosopher';
import philosopherService from '../services/philosophers/PhilosopherService';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';

const PhilosopherSelectionPage: React.FC = () => {
	const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const navigate = useNavigate();

	useEffect(() => {
		const fetchPhilosophers = async () => {
			try {
				const response = await philosopherService.getAllPhilosophers();
				console.log("response:", response);
				setPhilosophers(response.philosophers.map((philosopher: Philosopher) => philosopher));
			} catch (error) {
				console.error('Failed to fetch philosophers:', error);
			}
		}
		fetchPhilosophers();
	}, [])

	useEffect(() => {
		console.log("philsophers:", philosophers);
	}, [philosophers]);

  const handlePhilosopherSelect = (philosopherId: string) => {
    navigate(`/chat/${philosopherId}`);
  };

  return (
    <Layout 
      title="Choose Your Philosopher" 
      subtitle="Select a philosopher to begin your conversation"
      backPath="/"
    >
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Description */}
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600">
              Select a philosopher to engage in deep conversations about life, wisdom, and the nature of existence.
            </p>
          </div>

          {/* Philosopher Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {philosophers?.length > 0 && philosophers.sort((a,b) => a.sortOrder - b.sortOrder).map((philosopher) => (
              <div
                key={philosopher.id}
                onClick={() => handlePhilosopherSelect(philosopher.id)}
                className="philosopher-card bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 !cursor-pointer group"
              >
                {/* Philosopher Image */}
                <div className="w-50 h-50 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="w-42 h-42 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <img
											src={supabase.storage.from('Portraits').getPublicUrl(philosopher.image.split('/').pop() || '').data.publicUrl}
											alt={philosopher.name}
											className="w-full h-full object-cover rounded-full"
										/>
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
                    {philosopher.dates} • {philosopher.location}
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
        </div>
      </div>
    </Layout>
  );
};

export default PhilosopherSelectionPage;
