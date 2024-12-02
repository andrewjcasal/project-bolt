import OpenAI from 'openai';
import { createOpenAIError } from './errors';

const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  maxRetries: 3,
  timeout: 30000
};

let openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    if (!OPENAI_CONFIG.apiKey) {
      throw createOpenAIError({ message: 'OpenAI API key is not configured' });
    }
    try {
      openaiClient = new OpenAI(OPENAI_CONFIG);
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      throw createOpenAIError(error);
    }
  }
  return openaiClient;
};

export const handleOpenAIRequest = async <T>(
  request: () => Promise<T>
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw createOpenAIError(error);
  }
};