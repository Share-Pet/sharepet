import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  User, 
  Heart,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
  Bell
} from 'lucide-react';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  // Dummy event data with placeholder images
  const events = [
    {
      id: 1,
      title: "Weekend Dog Park Meetup",
      location: "Central Park",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      attendees: 24,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop",
      description: "Join fellow dog lovers for a fun morning at the park!"
    },
    {
      id: 2,
      title: "Pet Adoption Fair",
      location: "Community Center",
      date: "Dec 20, 2024",
      time: "2:00 PM",
      attendees: 45,
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop",
      description: "Help pets find their forever homes"
    },
    {
      id: 3,
      title: "Cat Cafe Social Hour",
      location: "Whiskers Cafe",
      date: "Dec 22, 2024",
      time: "4:00 PM",
      attendees: 18,
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=250&fit=crop",
      description: "Relax with adorable cats and meet new friends"
    },
    {
      id: 4,
      title: "Pet Training Workshop",
      location: "Training Academy",
      date: "Dec 25, 2024",
      time: "11:00 AM",
      attendees: 32,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=250&fit=crop",
      description: "Learn professional training techniques"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [events.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="pb-20">
            {/* Header */}

            {/* Events Carousel */}
            <div className="px-6 -mt-6">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                  
                  <div className="relative">
                    {/* Carousel Container */}
                    <div className="overflow-hidden rounded-2xl">
                      <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      >
                        {events.map((event, index) => (
                          <div key={event.id} className="w-full flex-shrink-0">
                            <div className="relative">
                              <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {event.time}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-200 mt-1">{event.attendees} attending</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button 
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                      {events.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentSlide 
                              ? 'bg-orange-500 w-6' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Find Playmates</h3>
                  <p className="text-sm text-gray-600">Connect with pets nearby</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Book Services</h3>
                  <p className="text-sm text-gray-600">Grooming, training & more</p>
                </div>
              </div>
            </div>

            {/* Featured Community */}
            <div className="px-6 mt-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-purple-500"></div>
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-purple-500"></div>
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-purple-500"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Join Golden Retrievers Club</h3>
                <p className="text-purple-100 text-sm mb-4">1,247 members sharing tips and organizing meetups</p>
                <button className="bg-white text-purple-600 font-medium py-2 px-4 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Join Community
                </button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
        <div className="min-h-screen">
          {renderContent()}
        </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center pb-20">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                {React.createElement(navigationItems.find(item => item.id === activeTab)?.icon || Home, {
                  className: "w-12 h-12 text-white"
                })}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                {activeTab}
              </h2>
              <p className="text-gray-600">This section is coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">We're working hard to bring you amazing features.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="min-h-screen">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;