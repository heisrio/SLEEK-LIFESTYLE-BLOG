
import type { BlogPost } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The blog data flows through the real backend API so the public page and admin dashboard share the same source of truth.
export const postService = {
  getAllPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts`);

    if (!response.ok) {
      throw new Error('Unable to fetch posts');
    }

    return response.json() as Promise<BlogPost[]>;
  },

  getPost: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${slug}`);

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<BlogPost>;
  },

  create: async (data: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Create failed' }));
      throw new Error(error.message || 'Create failed');
    }

    return response.json();
  },

  update: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Update failed');
    }

    return response.json();
  },

  remove: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || 'Delete failed');
    }

    return response.json();
  },
};
