import { useState, useCallback, useEffect } from 'react';
import { getTokenUsage, updateTokenUsage } from '../utils/tokens/api';
import { getDeviceId } from '../utils/tokens/device';
import { validateTokenMetrics, sanitizeTokenMetrics } from '../utils/tokens/validation';
import type { TokenUsage, TokenMetrics } from '../utils/tokens/types';

export const useTokens = () => {
  const [usage, setUsage] = useState<TokenUsage>({
    used: 0,
    limit: 100000,
    lastReset: new Date().toISOString()
  });
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const deviceId = getDeviceId();
      const data = await getTokenUsage(deviceId);
      setUsage(data);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to fetch token usage';
      setError(errorMessage);
      console.error(errorMessage, err);
    }
  }, []);

  const updateTokens = useCallback(async (metrics: TokenMetrics) => {
    try {
      if (!validateTokenMetrics(metrics)) {
        throw new Error('Invalid token metrics format');
      }

      const sanitizedMetrics = sanitizeTokenMetrics(metrics);
      
      if (usage.used + sanitizedMetrics.totalTokens > usage.limit) {
        setError('Token limit reached');
        return false;
      }

      const deviceId = getDeviceId();
      const updated = await updateTokenUsage(deviceId, sanitizedMetrics.totalTokens);
      
      setUsage({
        ...updated,
        used: Math.max(0, updated.used)
      });
      setError(null);
      return updated.used < updated.limit;
    } catch (err) {
      const errorMessage = 'Failed to update token usage';
      setError(errorMessage);
      console.error(errorMessage, err);
      return false;
    }
  }, [usage.used, usage.limit]);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  return {
    usage,
    error,
    updateTokens,
    hasTokens: usage.used < usage.limit
  };
};