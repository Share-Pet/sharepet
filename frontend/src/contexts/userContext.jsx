import React, { createContext, useContext, useEffect, useState } from 'react';

// Create context
const UserContext = createContext();

// Custom hook for convenience
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // Load user from localStorage once
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  useEffect(() => {
    const storedUser = localStorage.getItem('PawHood_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('PawHood_user', JSON.stringify(user));
    }
  }, [user]);

  const logoutUser = () => {
    try {
      localStorage.removeItem('PawHood_user');
      setUser(null);
      // Sign out from Google
      if (window.google && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('PawHood_user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
