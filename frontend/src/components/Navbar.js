import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays, Footprints, Dog, Cat, Search, Bell, LogOut, Heart, LogInIcon, LogOutIcon, LogIn } from 'lucide-react';
import { useUser } from '../contexts/userContext';

export default function Navbar() {
  const { user, setUser, logoutUser } = useUser();
  return (
    <div className="mb-8 bg-gradient-to-r from-orange-500 to-pink-500 px-6 pt-2 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0] || 'Friend'}! 👋</h1>
        </div>
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-lg font-medium">
            <Heart className="w-5 h-5" fill="currentColor" />
            "Every pet deserves endless love"
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <p className="text-orange-100 text-sm mt-1">Connecting hearts, one paw at a time</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={logoutUser}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            title="Sign Out"
          >
            {user ? <LogOutIcon className="w-5 h-5" /> : <LogInIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
