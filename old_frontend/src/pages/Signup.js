import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Phone, Mail, ArrowRight, Heart, Shield, Check, User, Home, Users, Calendar, LogOut } from 'lucide-react';

const SignupPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkAuthStatus();
    // loadGoogleScript();
  }, []);

  // Check if user data exists in localStorage
  const checkAuthStatus = () => {
    try {
      const savedUser = localStorage.getItem('pawshare_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setActiveTab('home');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('pawshare_user');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services
  const loadGoogleScript = () => {
    if (window.google) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      setError('Google Sign-In is temporarily unavailable');
      setLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeGoogle = () => {
    if (window.google) {
      console.log('Hii avijit')
      console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID);
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error('Google initialization failed:', error);
        setError('Google Sign-In initialization failed');
        setLoading(false);
      }
    }
  };

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      const responsePayload = decodeJWTResponse(response.credential);
      console.log('Google Sign-In Success:', responsePayload);
      
      // Create user object with Google data
      const userData = {
        id: responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture,
        loginTime: new Date().toISOString(),
        provider: 'google'
      };

      // Save user data to localStorage (in production, you'd send this to your backend)
      localStorage.setItem('pawshare_user', JSON.stringify(userData));
      
      // Update app state
      setCurrentUser(userData);
      setIsAuthenticated(true);
      setActiveTab('home');
      
      console.log('User authenticated:', userData);
      
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Decode JWT token
  const decodeJWTResponse = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  // Trigger Google Sign-In
  const handleGoogleSignIn = () => {
    if (window.google && googleLoaded) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Google prompt error:', error);
        setError('Failed to open Google Sign-In. Please try again.');
      }
    } else {
      setError('Google Sign-In is not ready. Please wait and try again.');
    }
  };

  // Sign out user
  const handleSignOut = () => {
    try {
      // Clear user data
      localStorage.removeItem('pawshare_user');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setActiveTab('profile');
      
      // Sign out from Google
      if (window.google && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // Login Screen Component
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            PawShare
          </h1>
          <p className="text-gray-600 mt-2">Connect with pet lovers in your community</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome to PawShare
          </h2>
          
          <p className="text-gray-600 text-center mb-8">
            Sign in with your Google account to get started
          </p>

          {/* Google Sign-In Button */}
          <GoogleLogin
            disabled={!googleLoaded || loading}
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
              handleGoogleResponse(credentialResponse);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center mt-6">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Secure
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              Trusted
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );

  // Home Screen Component
  const HomeScreen = () => (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 pt-12 pb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser?.picture} 
              alt={currentUser?.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">Hello, {currentUser?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-orange-100 mt-1">Ready to make some furry friends?</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Pet Love Motto */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-lg font-medium">
            <Heart className="w-5 h-5" fill="currentColor" />
            "Every pet deserves endless love"
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <p className="text-orange-100 text-sm mt-1">Connecting hearts, one paw at a time</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="px-6 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to PawShare! 🐾</h2>
          <p className="text-gray-600 mb-4">
            You're successfully signed in with Google. Here's what you can do:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Connect with pet lovers</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Join pet events</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <Heart className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">Share pet stories</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Debug */}
      <div className="px-6 mt-6">
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">🔍 Debug: User Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {currentUser?.name}</p>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <p><strong>ID:</strong> {currentUser?.id}</p>
            <p><strong>Login Time:</strong> {new Date(currentUser?.loginTime).toLocaleString()}</p>
            <p><strong>Provider:</strong> {currentUser?.provider}</p>
            <p><strong>Auth Status:</strong> <span className="text-green-600 font-medium">✅ Authenticated</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  // Profile Screen Component
  const ProfileScreen = () => (
    <div className="pb-20 p-6">
      {isAuthenticated ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <img 
              src={currentUser?.picture} 
              alt={currentUser?.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentUser?.name}</h2>
            <p className="text-gray-600 mb-6">{currentUser?.email}</p>
            
            <div className="space-y-4">
              <div className="text-left space-y-2">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-medium text-green-600">✅ Verified with Google</p>
              </div>
              
              <div className="text-left space-y-2">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(currentUser?.loginTime).toLocaleDateString()}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <LoginScreen />
      )}
    </div>
  );

  const renderContent = () => {
    if (!isAuthenticated) {
      return <LoginScreen />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center pb-20">
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
              <p className="text-sm text-gray-500 mt-2">We're building amazing features for you.</p>
            </div>
          </div>
        );
    }
  };

  // Show loading screen while checking auth
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PawShare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen">
        {renderContent()}
      </div>

      {/* Bottom Navigation - Only show when authenticated */}
      {isAuthenticated && (
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
      )}
    </div>
  );
};

export default SignupPage;