// Central type definitions for the application

export interface User {
  id: string;
  name: string;
  location: string;
  bio: string;
  avatar: string;
  email?: string;
  pets: Pet[];
  stats: UserStats;
}

export interface Pet {
  id?: string;
  name: string;
  breed: string;
  age: string;
  image: string;
  type?: 'dog' | 'cat' | 'bird' | 'other';
}

export interface UserStats {
  posts: number;
  events: number;
  friends: number;
}

export interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    petName: string;
  };
  content: string;
  image: string;
  likes: number;
  comments: number;
  timeAgo: string;
  createdAt?: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  organizer: string;
  description: string;
  isJoined?: boolean;
}

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'event' | 'friend' | 'follow';
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timeAgo: string;
  read: boolean;
  createdAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export type TabId = 'community' | 'events' | 'profile';