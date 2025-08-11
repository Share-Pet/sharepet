import React, { useEffect, useState } from 'react';

interface GoogleAuthButtonProps {
  onSuccess: (response: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false
}) => {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoogleScript();
  }, []);

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
      onError?.('Google Sign-In is temporarily unavailable');
      setLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeGoogle = () => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error('Google initialization failed:', error);
        onError?.('Google Sign-In initialization failed');
        setLoading(false);
      }
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const responsePayload = decodeJWTResponse(response.credential);
      
      const googleData = {
        google_id: responsePayload.sub,
        email: responsePayload.email,
        name: responsePayload.name,
        profile_image: responsePayload.picture
      };

      onSuccess(googleData);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      onError?.('Google Sign-In failed. Please try again.');
    }
  };

  const decodeJWTResponse = (token: string) => {
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

  const handleClick = () => {
    if (window.google && googleLoaded && !disabled) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Google prompt error:', error);
        onError?.('Failed to open Google Sign-In. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-100 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3" />
        Loading Google Sign-In...
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !googleLoaded}
      className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {disabled ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
};