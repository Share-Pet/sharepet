import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Plus, CalendarDays, Footprints, Dog, Cat, Search, Bell, LogOut, Heart, Lock, User, UserPlus } from 'lucide-react';
import { useUser } from '../contexts/userContext';
import { handleGoogleResponse } from '../pages/Signup';
import { useLoginMutation } from '../endpoints';
import 'react-toastify/dist/ReactToastify.css';

export const LoggedOutProfilePage = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, setUser, logoutUser } = useUser();
    const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation();

    const loginUser = (response) => {
      return handleGoogleResponse(response, login, setLoading, setError, setUser);
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl mb-4 shadow-lg">
            <Footprints className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
          Join our community of pet lovers
          </h1>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Welcome to PawHood!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Create an account to start sharing pet care with your community. 
            Connect with trusted neighbors and give your furry friends the love they deserve.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <GoogleLogin
                disabled={false || loading}
                onSuccess={loginUser}
                onError={() => {
                console.log('Login Failed');
                }}
            />
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="space-y-6">
          {/* Pets Preview */}
          <div className="bg-white rounded-3xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-80 z-10"></div>
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Footprints className="text-orange-500" />
              Your Pets
            </h2>
            
            <div className="space-y-3 opacity-60">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Dog className="text-orange-500" />
                <span className="text-lg">Add your first pet</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Cat className="text-pink-500" />
                <span className="text-lg">Share pet details</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-orange-800 font-medium">
                Sign up to add and manage your pets' profiles
              </p>
            </div>
          </div>

          {/* Bookings Preview */}
          <div className="bg-white rounded-3xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-80 z-10"></div>
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="text-purple-500" />
              Your Bookings
            </h2>
            
            <div className="space-y-3 opacity-60">
              <div className="flex items-center justify-between border rounded-xl p-3 bg-gradient-to-r from-orange-50 to-pink-50">
                <div>
                  <p className="font-medium">Pet sitting requests</p>
                  <p className="text-sm text-gray-500">Connect with pet parents</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">Coming soon</span>
              </div>
              <div className="flex items-center justify-between border rounded-xl p-3 bg-gradient-to-r from-purple-50 to-pink-50">
                <div>
                  <p className="font-medium">Your pet care offers</p>
                  <p className="text-sm text-gray-500">Help other pet owners</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">Available</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-800 font-medium">
                Join to start booking and offering pet care services
              </p>
            </div>
          </div>

          {/* Community Features */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="text-pink-500" />
              Community Benefits
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-pink-50 rounded-xl text-center">
                <Search className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 mb-1">Find Pet Sitters</h3>
                <p className="text-sm text-gray-600">Trusted neighbors in your area</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-xl text-center">
                <Bell className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 mb-1">Get Notifications</h3>
                <p className="text-sm text-gray-600">Never miss a pet care opportunity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Modal Forms */}
        {showLoginForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Welcome Back!</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border rounded-lg"
                />
                <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white p-3 rounded-lg font-semibold">
                  Log In
                </button>
              </div>
              <button
                onClick={() => setShowLoginForm(false)}
                className="mt-4 text-gray-500 hover:text-gray-700 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showSignupForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Join PawHood</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Create password"
                  className="w-full p-3 border rounded-lg"
                />
                <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white p-3 rounded-lg font-semibold">
                  Create Account
                </button>
              </div>
              <button
                onClick={() => setShowSignupForm(false)}
                className="mt-4 text-gray-500 hover:text-gray-700 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {
            error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )
        }
      </div>
    </div>
  );
};

// export default LoggedOutProfilePage;