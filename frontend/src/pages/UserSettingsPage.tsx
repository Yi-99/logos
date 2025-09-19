import React, { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import Layout from '../components/Layout';

const UserSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    console.log('Saving changes...');
  };

  const handleCancel = () => {
    // TODO: Reset form or navigate away
    console.log('Canceling changes...');
  };

  const handlePlanSelect = (plan: string) => {
    console.log(`Selected plan: ${plan}`);
  };

  return (
    <Layout 
      title="Account Settings" 
      subtitle="Manage your profile and subscription preferences"
      backPath="/"
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'subscription'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscription
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h2>
            <p className="text-sm text-gray-600 mb-6">Update your personal information and preferences</p>

            {/* Avatar Section */}
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">JD</span>
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2">
                  Change Avatar
                </button>
                <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h2>
              <p className="text-sm text-gray-600 mb-4">You are currently on the Free plan</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">Free Plan</span>
                <span className="text-sm text-gray-500">$0/forever</span>
              </div>
            </div>

            {/* Choose Your Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Choose Your Plan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                    <StarIcon className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">$0/forever</p>
                  <p className="text-sm text-gray-600 mb-4">Perfect for getting started with philosophical conversations</p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      3 conversations per day
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Text-to-text mode only
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Access to 3 philosophers
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Basic chat history
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect('free')}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Current Plan
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                  
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <StarIcon className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">$9.99/month</p>
                  <p className="text-sm text-gray-600 mb-4">Unlock the full potential of philosophical discourse</p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Unlimited conversations
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      All interaction modes
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Access to all 6 philosophers
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Advanced chat history & search
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Priority support
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Export conversations
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect('pro')}
                    className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Choose Pro
                  </button>
                </div>

                {/* Lifetime Plan */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                    <AllInclusiveIcon className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifetime</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">$99.99/one-time</p>
                  <p className="text-sm text-gray-600 mb-4">One payment, lifetime access to all features</p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Everything in Pro
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Lifetime access
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Future feature updates
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Premium philosopher voices
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Advanced customization
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckIcon sx={{ fontSize: 16 }} className="text-green-500 mr-2" />
                      Beta feature access
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect('lifetime')}
                    className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Choose Lifetime
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Billing Information</h2>
              <p className="text-sm text-gray-600 mb-6">Manage your billing details and payment methods</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-xs text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    Update
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <SecurityIcon sx={{ fontSize: 16 }} />
                  <span>Payments are processed securely by Stripe</span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <EmailIcon sx={{ fontSize: 16 }} />
                  <span>Billing receipts are sent to john.doe@example.com</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default UserSettingsPage;
