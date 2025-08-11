import React, { useState, useMemo } from 'react';
import { Heart, MessageCircle, Calendar, Users, MapPin, Plus, Search, Bell, Settings, Camera, Edit3, Star } from 'lucide-react';
import { AuthUser, useAuth } from '../contexts/AuthContext';
import { PhotoUpload } from './PhotoUpload';
import { AddPetModal } from './AddPetModal';
import { EditProfileModal } from './EditProfileModal';
import { CreatePostModal } from './CreatePostModal';
import { NotificationPanel } from './NotificationPanel';
import { Post, Event, Notification, User, TabId } from '../types';

interface MainAppProps {
  user: AuthUser | null;
}

export const MainApp: React.FC<MainAppProps> = ({ user: authUser }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('community');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  // Convert AuthUser to User for compatibility
  const [profile, setProfile] = useState<User>({
    id: authUser?.id || '1',
    name: authUser?.name || 'User',
    location: authUser?.location?.city && authUser?.location?.state 
      ? `${authUser.location.city}, ${authUser.location.state}` 
      : 'New York, NY',
    bio: 'Pet lover and community member',
    avatar: authUser?.avatar || authUser?.profile_image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authUser?.name || 'User'),
    email: authUser?.email,
    pets: [],
    stats: {
      posts: 127,
      events: 23,
      friends: 456
    }
  });

  // Modal states
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filtered data based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.petName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return mockEvents;
    return mockEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const toggleLike = (postId: number) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handlePhotoSelect = (file: File) => {
    console.log('Photo selected:', file);
  };

  const handleAddPet = (newPet: { name: string; breed: string; age: string; image: string }) => {
    setProfile(prev => ({
      ...prev,
      pets: [...prev.pets, { ...newPet, id: Date.now().toString() }]
    }));
  };

  const handleEditProfile = (updatedProfile: User) => {
    setProfile(updatedProfile);
  };

  const handleCreatePost = (content: string, image?: string) => {
    const newPost: Post = {
      id: posts.length + 1,
      user: {
        name: profile.name,
        avatar: profile.avatar,
        petName: profile.pets[0]?.name || 'Pet'
      },
      content,
      image: image || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop',
      likes: 0,
      comments: 0,
      timeAgo: 'Just now'
    };
    setPosts(prev => [newPost, ...prev]);
    setProfile(prev => ({
      ...prev,
      stats: { ...prev.stats, posts: prev.stats.posts + 1 }
    }));
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const renderCommunityTab = () => (
    <div className="space-y-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-4">
          <img
            src={profile.avatar}
            alt="Your avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div 
            className="flex-1 bg-gray-50 rounded-full px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowCreatePost(true)}
          >
            <span className="text-gray-500">Share your pet's adventure...</span>
          </div>
          <button 
            className="bg-gradient-to-r from-red-400 to-pink-400 text-white p-3 rounded-full hover:scale-105 transition-transform"
            onClick={() => setShowPhotoUpload(true)}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Posts */}
      {filteredPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{post.user.name}</h4>
                <p className="text-sm text-gray-500">with {post.user.petName} • {post.timeAgo}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
          </div>
          
          <div className="aspect-video">
            <img
              src={post.image}
              alt="Pet photo"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  likedPosts.has(post.id)
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-200 ${
                    likedPosts.has(post.id) ? 'fill-current' : ''
                  }`}
                />
                <span className="font-medium">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{post.comments}</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {filteredPosts.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No posts found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      {/* Create Event Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        <button className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform flex items-center space-x-2 font-medium shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Event Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                  {event.date}
                </div>
                <div className="text-gray-500 text-sm">{event.time}</div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
              
              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{event.location}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {event.attendees}/{event.maxAttendees} attending
                  </span>
                </div>
                <button className="bg-gradient-to-r from-red-400 to-pink-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform">
                  Join Event
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 rounded-2xl overflow-hidden">
        <div className="p-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <button 
                  className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
                  onClick={() => setShowEditProfile(true)}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="flex items-center justify-center md:justify-start space-x-2 text-white text-opacity-90 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </p>
              <p className="text-white text-opacity-90 max-w-md">{profile.bio}</p>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.stats.posts}</div>
                  <div className="text-sm text-white text-opacity-80">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.stats.events}</div>
                  <div className="text-sm text-white text-opacity-80">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.stats.friends}</div>
                  <div className="text-sm text-white text-opacity-80">Friends</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Pets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">My Pets</h3>
          <button 
            className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center space-x-2"
            onClick={() => setShowAddPet(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Pet</span>
          </button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {profile.pets.map((pet, index) => (
            <div key={pet.id || index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{pet.name}</h4>
                  <p className="text-gray-600">{pet.breed}</p>
                  <p className="text-sm text-gray-500">{pet.age}</p>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">VIP</span>
                </div>
              </div>
            </div>
          ))}
          
          {profile.pets.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <div className="text-gray-300 mb-4">
                <Heart className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-500">No pets added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first pet to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PawHood</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search pets, events, friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-6 h-6" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-300 transition-all"
                onClick={() => setActiveTab('profile')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'community' && renderCommunityTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </main>

      {/* Navigation Tabs */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-sm">
        <div className="px-4 sm:px-8 lg:px-16">
          <div className="flex justify-around sm:justify-between">
            {[
              { id: 'community', label: 'Community', icon: Users },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'profile', label: 'Profile', icon: Heart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 py-3 px-2 border-t-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-400 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Modals */}
      <PhotoUpload
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onPhotoSelect={handlePhotoSelect}
      />
      
      <AddPetModal
        isOpen={showAddPet}
        onClose={() => setShowAddPet(false)}
        onAddPet={handleAddPet}
      />
      
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        onSave={handleEditProfile}
      />
      
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
        userAvatar={profile.avatar}
        userName={profile.name}
      />
      
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />
    </div>
  );
};

// Mock data
const initialPosts: Post[] = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      petName: "Luna"
    },
    content: "Luna had the most amazing day at the beach! She made so many new furry friends. Looking forward to the next beach meetup! 🏖️",
    image: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop",
    likes: 24,
    comments: 8,
    timeAgo: "2h ago"
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      petName: "Max"
    },
    content: "Training session with Max went so well today! He finally mastered the agility course. Proud dad moment! 🐕",
    image: "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop",
    likes: 18,
    comments: 5,
    timeAgo: "4h ago"
  }
];

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Downtown Dog Park Meetup",
    date: "Mar 25",
    time: "2:00 PM",
    location: "Central Park East",
    attendees: 15,
    maxAttendees: 30,
    image: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    organizer: "Pet Lovers NYC",
    description: "Join us for a fun-filled afternoon at the dog park! Socialization, games, and treats for all!"
  }
];

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    message: 'liked your post about your pet\'s training session',
    timeAgo: '5 minutes ago',
    read: false
  }
];