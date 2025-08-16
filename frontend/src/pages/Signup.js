import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Phone, Mail, ArrowRight, PawPrint, Footprints, Heart, Shield, Check, User, Home, Users, Calendar, LogOut } from 'lucide-react';
import { createIcons, icons } from 'lucide';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/userContext';
import { ToastContainer, toast } from 'react-toastify';
import { useLoginMutation } from '../endpoints';
import { setTokens } from '../utils/auth';
import 'react-toastify/dist/ReactToastify.css';

// Decode JWT token - moved outside component as utility function
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

  // Google authentication function - now using the hook from component level
export const googleAuth = async (userData, login) => {
  try {
    const response = await login(userData).unwrap();
    console.log('Login response:', response);
    const { access_token, refresh_token } = response?.data?.tokens;
    console.log(access_token);
    setTokens(access_token, refresh_token);
    toast.success('🚀 Signup Successful! Welcome to PawHood');
    return response;
  } catch (error) {
    console.error('Google Auth API Error:', error);
    toast.error('Signup Failed, Please try again!');
  }
};
  
  // Handle Google Sign-In response
export const handleGoogleResponse = async (response, login, setLoading, setError, setUser) => {
  try {
    setLoading(true);
    setError('');
    const responsePayload = decodeJWTResponse(response.credential);
    console.log('Google Sign-In Success:', responsePayload);
    const userData = {
      google_id: responsePayload.sub,
      name: responsePayload.name,
      email: responsePayload.email,
      profile_image: responsePayload.picture,
      loginTime: new Date().toISOString(),
      provider: 'google'
    };
    // Set user in context
    setUser(userData);
    // Authenticate with backend
    await googleAuth(userData, login);
    console.log('User authenticated:', userData);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    setError('Google Sign-In failed. Please try again.');
    toast.error('Google Sign-In failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { user, setUser, logoutUser } = useUser();
  const navigate = useNavigate();
  const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation();

  // Initialize lucide icons
  useEffect(() => {
    createIcons({ icons });
  }, []);

  const loginUser = (response) => {
    handleGoogleResponse(response, login, setLoading, setError, setUser);
    setTimeout(() => {
      navigate('/profile');
    }, 1000);
  };

  // Handle Google Sign-In error
  const handleGoogleError = () => {
    console.log('Google Login Failed');
    setError('Google Sign-In failed. Please try again.');
    toast.error('Google Sign-In failed. Please try again.');
  };

  // Login Screen Component
  const LoginScreen = () => (
    <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <PawPrint className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            PawHood
          </h1>
          <p className="text-gray-600 mt-2">Connect with pet lovers in your community</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome to PawHood
          </h2>
          
          <p className="text-gray-600 text-center mb-8">
            Sign in with your Google account to get started
          </p>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <GoogleLogin
              disabled={loading || loginLoading}
              onSuccess={loginUser}
              onError={handleGoogleError}
            />
          </div>

          {/* Error Display */}
          {(error || loginError) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm text-center">
                {error || loginError?.data?.message || 'An error occurred'}
              </p>
            </div>
          )}

          {/* Loading state */}
          {(loading || loginLoading) && (
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

  const renderContent = () => {
    if (!user) {
      return <LoginScreen />;
    }
    
    toast.success('Already LoggedIn! Redirecting...', { position: 'top-center' });
    setTimeout(() => {
      navigate('/profile');
    }, 1000);
    
    return null; // Return null instead of undefined
  };

  // Show loading screen while checking auth
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PawHood...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen">
        {renderContent()}
        <ToastContainer />
      </div>
    </div>
  );
};

export default SignupPage;