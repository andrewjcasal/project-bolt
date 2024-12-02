import { validateTokens } from './validation';
import { saveTokenUsage, loadTokenUsage } from './storage';
import type { TokenUsage } from './types';

const getDefaultUsage = (): TokenUsage => {
  const now = new Date().toISOString();
  return {
    used: 0,
    limit: 5000, // Changed from 50000 to 5000
    lastReset: now
  };
};

const shouldReset = (lastReset: string): boolean => {
  const resetDate = new Date(lastReset);
  const now = new Date();
  
  // Reset if more than 24 hours have passed
  if (now.getTime() - resetDate.getTime() > 24 * 60 * 60 * 1000) {
    return true;
  }
  
  // Reset if it's a new day (UTC)
  return resetDate.getUTCDate() !== now.getUTCDate();
};

export const TokenAPI = {
  getUsage: async (deviceId: string): Promise<TokenUsage> => {
    try {
      const stored = loadTokenUsage();
      if (!stored) {
        const initial = getDefaultUsage();
        saveTokenUsage(initial);
        return initial;
      }

      if (shouldReset(stored.lastReset)) {
        const reset = getDefaultUsage();
        saveTokenUsage(reset);
        return reset;
      }

      return stored;
    } catch (error) {
      console.error('Error getting token usage:', error);
      return getDefaultUsage();
    }
  },

  updateUsage: async (deviceId: string, tokens: number): Promise<TokenUsage> => {
    try {
      const current = await TokenAPI.getUsage(deviceId);
      const validTokens = validateTokens(tokens);
      
      const updated: TokenUsage = {
        ...current,
        used: current.used + validTokens
      };
      
      saveTokenUsage(updated);
      return updated;
    } catch (error) {
      console.error('Error updating token usage:', error);
      throw error;
    }
  }
};