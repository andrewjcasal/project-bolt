import type { TokenUsage } from './types';

export const TokenAPI = {
  getUsage: async (deviceId: string): Promise<TokenUsage> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tokens/usage/${deviceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token usage');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting token usage:', error);
      throw error;
    }
  },

  updateUsage: async (deviceId: string, tokens: number): Promise<TokenUsage> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tokens/usage/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update token usage');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating token usage:', error);
      throw error;
    }
  }
};