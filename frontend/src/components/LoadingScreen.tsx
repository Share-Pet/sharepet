import React from 'react';
import { Heart } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
          <Heart className="w-8 h-8 text-white fill-current" />
        </div>
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading PawHood...</h2>
        <p className="text-gray-600">Preparing your pet community experience</p>
      </div>
    </div>
  );
};