export interface TokenUsage {
  used: number;
  limit: number;
  lastReset: string;
}

export interface TokenMetrics {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  conversation?: number;
  timestamp?: number;
}

export interface TokenUpdate {
  totalTokens: number;
  conversation?: number;
  timestamp?: number;
}