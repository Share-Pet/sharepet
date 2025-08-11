// App configuration constants
export const APP_CONFIG = {
  name: 'PawHood',
  description: 'Connect with pet lovers in your community',
  version: '1.0.0'
} as const;

// Navigation tabs configuration
export const NAVIGATION_TABS = [
  { id: 'community', label: 'Community', icon: 'Users' },
  { id: 'events', label: 'Events', icon: 'Calendar' },
  { id: 'profile', label: 'Profile', icon: 'Heart' }
] as const;

// Storage keys
export const STORAGE_KEYS = {
  user: 'pawhood_user',
  theme: 'pawhood_theme',
  settings: 'pawhood_settings'
} as const;

// API endpoints (for future use)
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile'
  },
  posts: {
    list: '/api/posts',
    create: '/api/posts',
    like: '/api/posts/:id/like',
    comment: '/api/posts/:id/comments'
  },
  events: {
    list: '/api/events',
    create: '/api/events',
    join: '/api/events/:id/join'
  }
} as const;