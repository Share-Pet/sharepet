import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, GoogleAuthRequest } from '../services/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  loginTime: string;
  provider: 'email' | 'google';
  profile_image?: string;
  user_role?: string;
  coins_balance?: number;
  referral_code?: string;
  location?: {
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  loginWithGoogle: (googleData: GoogleAuthRequest) => Promise<{ success: boolean; error?: string; is_new_user?: boolean }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have tokens
      if (apiService.isAuthenticated()) {
        // Try to get user profile from backend
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          const backendUser = response.data;
          const authUser: AuthUser = {
            id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
            avatar: backendUser.profile_image,
            profile_image: backendUser.profile_image,
            user_role: backendUser.user_role,
            coins_balance: backendUser.coins_balance,
            referral_code: backendUser.referral_code,
            location: backendUser.location,
            loginTime: new Date().toISOString(),
            provider: 'google'
          };
          setUser(authUser);
          // Save to localStorage for offline access
          localStorage.setItem('pawhood_user', JSON.stringify(authUser));
        } else {
          // Token might be invalid, clear it
          await apiService.logout();
          localStorage.removeItem('pawhood_user');
        }
      } else {
        // Fallback to localStorage for offline mode
        const savedUser = localStorage.getItem('pawhood_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('pawhood_user');
      await apiService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: AuthUser) => {
    try {
      localStorage.setItem('pawhood_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const loginWithGoogle = async (googleData: GoogleAuthRequest): Promise<{ success: boolean; error?: string; is_new_user?: boolean }> => {
    try {
      const response = await apiService.authenticateWithGoogle(googleData);
      
      if (response.success && response.data) {
        const backendUser = response.data.user;
        const authUser: AuthUser = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          avatar: backendUser.profile_image,
          profile_image: backendUser.profile_image,
          user_role: backendUser.user_role,
          coins_balance: backendUser.coins_balance,
          referral_code: backendUser.referral_code,
          location: backendUser.location,
          loginTime: new Date().toISOString(),
          provider: 'google'
        };
        
        login(authUser);
        
        return {
          success: true,
          is_new_user: response.data.is_new_user
        };
      } else {
        return {
          success: false,
          error: response.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('pawhood_user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};