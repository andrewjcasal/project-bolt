export interface TokenMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface OpenAIResponse {
  text: string;
  metrics: TokenMetrics;
}