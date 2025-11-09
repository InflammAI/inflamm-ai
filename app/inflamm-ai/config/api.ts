// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  VYTAP: {
    TAP: '/api/v1/vytap/tap',
    LEADERBOARD: '/api/v1/vytap/leaderboard',
    BALANCE: '/api/v1/vytap/balance',
    STREAK: '/api/v1/vytap/streak',
  },
} as const;

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Make an API request with proper error handling
 */
async function apiRequest<T = any>(
  endpoint: string,
  method: ApiMethod = 'GET',
  data?: any
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available (only in browser)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    const responseData: ApiResponse<T> = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        responseData.message || 
        responseData.error || 
        `Request failed with status ${response.status}`
      );
    }

    return responseData as T;
  } catch (error) {
    console.error(`API Request Error (${method} ${url}):`, error);
    throw error;
  }
}

/**
 * Vytap API functions
 */
export const vytapApi = {
  // Tap to earn points
  tap: (userId: string, amount: number) => 
    apiRequest<{ success: boolean; points: number; message?: string }>(
      API_ENDPOINTS.VYTAP.TAP,
      'POST',
      { userId, amount }
    ),

  // Get leaderboard
  getLeaderboard: () => 
    apiRequest<Array<{
      userId: string;
      username: string;
      points: number;
      rank: number;
    }>>(API_ENDPOINTS.VYTAP.LEADERBOARD),

  // Get user balance
  getBalance: (userId: string) => 
    apiRequest<{ userId: string; balance: number }>(
      `${API_ENDPOINTS.VYTAP.BALANCE}?userId=${userId}`
    ),

  // Get user streak
  getStreak: (userId: string) => 
    apiRequest<{ userId: string; streak: number; lastTap: string }>(
      `${API_ENDPOINTS.VYTAP.STREAK}?userId=${userId}`
    ),
};

// Example usage in components:
/*
import { vytapApi } from '@/app/inflamm-ai/config/api';

// Tap action
const handleTap = async () => {
  try {
    const result = await vytapApi.tap('user123', 1);
    console.log('Points:', result.points);
  } catch (error) {
    console.error('Tap failed:', error.message);
  }
};

// Get leaderboard
const fetchLeaderboard = async () => {
  try {
    const leaderboard = await vytapApi.getLeaderboard();
    console.log('Leaderboard:', leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error.message);
  }
};
*/