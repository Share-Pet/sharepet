import { useState, useCallback } from 'react';
import { Post } from '../types';
import { apiService } from '../services/api';

export const usePosts = (initialPosts: Post[] = []) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (content: string, image?: string) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you'd call the API
      // const response = await apiService.createPost({ content, image });
      
      // For now, create a mock post
      const newPost: Post = {
        id: Date.now(),
        user: {
          name: 'Current User',
          avatar: 'https://ui-avatars.com/api/?name=Current+User',
          petName: 'My Pet'
        },
        content,
        image: image || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop',
        likes: 0,
        comments: 0,
        timeAgo: 'Just now'
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      return { success: true, post: newPost };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const likePost = useCallback((postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you'd call the API
      // await apiService.deletePost(postId);
      
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    setPosts,
    createPost,
    likePost,
    deletePost,
    loading,
    error
  };
};