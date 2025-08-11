import React, { useState } from 'react';
import { Heart, Users, Calendar, Camera, Star, ArrowRight } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { AuthUser } from '../contexts/AuthContext';

interface LandingPageProps {
  onAuthSuccess: (user: AuthUser) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Connect with Pet Lovers',
      description: 'Meet fellow pet parents in your neighborhood and make lasting friendships.'
    },
    {
      icon: Calendar,
      title: 'Join Pet Events',
      description: 'Discover fun activities, training sessions, and social meetups for you and your pet.'
    },
    {
      icon: Camera,
      title: 'Share Pet Moments',
      description: 'Post adorable photos and stories of your furry friends with the community.'
    },
    {
      icon: Star,
      title: 'Expert Resources',
      description: 'Access tips, advice, and resources from pet care experts and experienced owners.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-400 to-pink-400 rounded-3xl mb-8 shadow-lg animate-bounce">
              <Heart className="w-10 h-10 text-white fill-current" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                PawHood
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate community platform where pet lovers connect, share experiences, 
              and create unforgettable memories with their furry companions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-red-400 to-pink-400 text-white font-semibold px-8 py-4 rounded-2xl hover:from-red-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="text-gray-600 font-medium px-8 py-4 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { number: '10K+', label: 'Pet Parents' },
                { number: '500+', label: 'Events Hosted' },
                { number: '50K+', label: 'Photos Shared' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Pet Parents Love PawHood
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to connect with your local pet community and give your furry friends the best life possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all duration-200 group">
                <div className="w-14 h-14 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Pack?
          </h2>
          <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
            Start connecting with amazing pet parents in your area. Your pet's new best friend is just a click away!
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg inline-flex items-center gap-2"
          >
            Create Your Account
            <Heart className="w-5 h-5 fill-current text-red-500" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <h3 className="text-2xl font-bold">PawHood</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Connecting pet lovers, one paw at a time.
            </p>
            <div className="text-sm text-gray-500">
              © 2024 PawHood. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
};