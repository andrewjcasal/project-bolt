import { validateInput } from './anticheat';
import { STORY_GUIDELINES, VICTORY_CONDITIONS, DEFEAT_CONDITIONS } from './story/guidelines';
import { validateTokenAvailability } from '../tokens/validation';
import type { GameResponse, Difficulty } from '../../types/game';
import { DifficultyManager } from './difficulty/manager';
import type { TokenMetrics, TokenUsage } from '../tokens/types';

const SYSTEM_PROMPT = `${STORY_GUIDELINES}

${VICTORY_CONDITIONS}

${DEFEAT_CONDITIONS}`;

const PROMPT_TEMPLATE = `Generate a unique and creative prompt for a journey (maximum 280 characters) using this format or similar: "[Role], [location], [time], [challenge], [goal]."

Guidelines:
- Create unique character roles
- Design vivid settings
- Present clear challenges
- Set meaningful goals`;

const DEFAULT_PROMPT = "A merchant in an ancient bazaar must break a mysterious curse.";

const updateTokenUsage = async (completion: any, onTokensUsed?: (metrics: TokenMetrics) => void) => {
  if (onTokensUsed && completion?.usage) {
    await onTokensUsed({
      totalTokens: completion.usage.total_tokens,
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      timestamp: Date.now()
    });
  }
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse API response:', text);
    throw new Error('Invalid API response format');
  }
};

export const generatePrompt = async (
  difficulty: Difficulty = 'adaptive',
  onTokensUsed?: (metrics: TokenMetrics) => void,
  tokenUsage?: TokenUsage
): Promise<string> => {
  try {
    if (tokenUsage && !validateTokenAvailability(tokenUsage, 'PROMPT_GENERATION')) {
      throw new Error('Insufficient tokens for prompt generation');
    }

    const difficultyManager = DifficultyManager.getInstance();
    const config = difficultyManager.getConfig();

    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/generate-game-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role: "system",
          content: `${PROMPT_TEMPLATE}\n\nDifficulty Level: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}${config.instructions}`
        }],
        config,
        max_tokens: 150
      })
    });

    const data = await handleApiResponse(response);
    
    if (!data?.completion?.choices?.[0]?.message?.content) {
      console.error('Invalid API response structure:', data);
      return DEFAULT_PROMPT;
    }

    await updateTokenUsage(data.completion, onTokensUsed);
    return data.completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating prompt:', error);
    return DEFAULT_PROMPT;
  }
};

export const generateAIResponse = async (
  prompt: string,
  context?: string,
  difficulty: Difficulty = 'adaptive',
  onTokensUsed?: (metrics: TokenMetrics) => void,
  tokenUsage?: TokenUsage
): Promise<GameResponse> => {
  try {
    if (tokenUsage) {
      if (!validateTokenAvailability(tokenUsage, 'ANTI_CHEAT')) {
        throw new Error('Insufficient tokens for anti-cheat validation');
      }
      if (!validateTokenAvailability(tokenUsage, 'STORY_RESPONSE')) {
        throw new Error('Insufficient tokens for story response');
      }
    }

    const validationResult = await validateInput(prompt, onTokensUsed);
    if (!validationResult) {
      return {
        text: "Your action seems to conflict with the natural flow of the story. What would you like to try instead?",
        status: 'playing'
      };
    }

    const difficultyManager = DifficultyManager.getInstance();
    const config = difficultyManager.getConfig();
    
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/generate-game-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\nDifficulty Level: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}${config.instructions}`
          },
          ...(context ? [{
            role: "assistant",
            content: context
          }] : []),
          {
            role: "user",
            content: prompt
          }
        ],
        ...config.parameters
      })
    });

    const data = await handleApiResponse(response);
    
    if (!data?.completion?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response structure');
    }

    await updateTokenUsage(data.completion, onTokensUsed);

    const text = data.completion.choices[0].message.content;
    const isVictory = text.includes("You have successfully completed your quest");
    const isDefeat = text.includes("You have ultimately failed in your quest");
    
    return {
      text,
      status: isVictory ? 'won' : isDefeat ? 'lost' : 'playing'
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    if (error instanceof Error && error.message.includes('Insufficient tokens')) {
      return {
        text: "You don't have enough energy to continue. Please wait for your daily energy to reset.",
        status: 'playing'
      };
    }
    return {
      text: "Something went wrong. Please try again.",
      status: 'playing'
    };
  }
};