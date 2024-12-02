import { TOKEN_REQUIREMENTS, MINIMUM_TOKENS_REQUIRED } from './constants';
import type { TokenMetrics, TokenUsage } from './types';

export const validateTokens = (tokens: number): number => {
  if (!Number.isFinite(tokens) || tokens < 0) {
    console.warn('Invalid token value detected:', tokens);
    return 0;
  }
  return Math.floor(tokens);
};

export const validateTokenMetrics = (metrics: any): metrics is TokenMetrics => {
  if (!metrics || typeof metrics !== 'object') {
    console.error('Invalid metrics object:', metrics);
    return false;
  }

  // Handle OpenAI format
  if ('total_tokens' in metrics && Number.isFinite(metrics.total_tokens)) {
    metrics.totalTokens = metrics.total_tokens;
    delete metrics.total_tokens;
    return true;
  }

  // Handle our custom format
  if ('totalTokens' in metrics && Number.isFinite(metrics.totalTokens)) {
    return true;
  }

  // Handle legacy format
  if ('total' in metrics && Number.isFinite(metrics.total)) {
    metrics.totalTokens = metrics.total;
    delete metrics.total;
    return true;
  }

  console.error('Metrics validation failed:', metrics);
  return false;
};

export const sanitizeTokenMetrics = (metrics: TokenMetrics): TokenMetrics => {
  const sanitized: TokenMetrics = {
    totalTokens: validateTokens(metrics.totalTokens),
    timestamp: metrics.timestamp || Date.now()
  };

  if (metrics.promptTokens !== undefined) {
    sanitized.promptTokens = validateTokens(metrics.promptTokens);
  }
  if (metrics.completionTokens !== undefined) {
    sanitized.completionTokens = validateTokens(metrics.completionTokens);
  }
  if (metrics.conversation !== undefined) {
    sanitized.conversation = validateTokens(metrics.conversation);
  }

  return sanitized;
};

export const hasEnoughTokens = (
  usage: TokenUsage,
  requiredTokens: number
): boolean => {
  const remainingTokens = usage.limit - usage.used;
  return remainingTokens >= Math.max(requiredTokens, MINIMUM_TOKENS_REQUIRED);
};

export const validateTokenAvailability = (
  usage: TokenUsage,
  operation: keyof typeof TOKEN_REQUIREMENTS
): boolean => {
  const requiredTokens = TOKEN_REQUIREMENTS[operation];
  return hasEnoughTokens(usage, requiredTokens);
};