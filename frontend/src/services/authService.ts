
// Authentication service for the admin sign-in flow.
// The frontend authenticates through the backend API so the admin sign-in flow works in a real deployment.
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The frontend authenticates through the backend API so the admin sign-in flow works in a real deployment.
export const authService = {
  login: async (email: string, pass: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: pass }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  getProfile: async (token: string) => {
    const userId = token.split('_')[1];
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as User;
  },
};
