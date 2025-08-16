import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  User, 
} from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'community', label: 'Community', icon: Users, path: '/community' },
    { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
    { id: 'profile', label: 'Profile', icon: User, path: 'profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around py-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link to={item.path} key={item.id} className="flex flex-col items-center text-xs group">
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-pink-500' : 'text-gray-500 group-hover:text-pink-400'
                }`}
              />
              <span className={`${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>

    // <div className="flex-1 flex items-center justify-center pb-20">
    //   <div className="text-center p-8">
    //     <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
    //       {React.createElement(navigationItems.find(item => item.id === `/${location}`)?.icon || Home, {
    //         className: "w-12 h-12 text-white"
    //       })}
    //     </div>
    //     <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
    //       "Hii"
    //     </h2>
    //     <p className="text-gray-600">This section is coming soon!</p>
    //     <p className="text-sm text-gray-500 mt-2">We're working hard to bring you amazing features.</p>
    //   </div>
    // </div>
  );
}
