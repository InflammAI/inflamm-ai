// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  VYTAP: {
    TAP: `${API_URL}/api/v1/vytap/tap`,
    LEADERBOARD: `${API_URL}/api/v1/vytap/leaderboard`,
    BALANCE: `${API_URL}/api/v1/vytap/balance`,
    STREAK: `${API_URL}/api/v1/vytap/streak`,
  },
};
