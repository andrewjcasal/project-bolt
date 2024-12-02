import { getOpenAIClient, handleOpenAIRequest } from '../openai/client';
import { validateInput } from './anticheat';
import { STORY_GUIDELINES, VICTORY_CONDITIONS, DEFEAT_CONDITIONS } from './story/guidelines';
import { validateTokenAvailability } from '../tokens/validation';
import { TOKEN_REQUIREMENTS } from '../tokens/constants';
import type { GameResponse, Difficulty } from '../../types/game';
import { DifficultyManager } from './difficulty/manager';
import type { TokenMetrics } from '../openai/types';
import type { TokenUsage } from '../tokens/types';

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
  if (onTokensUsed && completion.usage) {
    await onTokensUsed({
      totalTokens: completion.usage.total_tokens,
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      timestamp: Date.now()
    });
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
    const openai = getOpenAIClient();
    
    const completion = await handleOpenAIRequest(() => 
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: `${PROMPT_TEMPLATE}\n\nDifficulty Level: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}${config.instructions}`
        }],
        ...config.parameters,
        max_tokens: 150
      })
    );

    await updateTokenUsage(completion, onTokensUsed);
    return completion.choices[0].message.content || DEFAULT_PROMPT;
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
      // Check tokens for anti-cheat
      if (!validateTokenAvailability(tokenUsage, 'ANTI_CHEAT')) {
        throw new Error('Insufficient tokens for anti-cheat validation');
      }
      // Check tokens for story response
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
    const openai = getOpenAIClient();
    
    const completion = await handleOpenAIRequest(() => 
      openai.chat.completions.create({
        model: "gpt-4o-mini",
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
    );

    await updateTokenUsage(completion, onTokensUsed);

    const text = completion.choices[0].message.content || "Something went wrong. Please try again.";
    
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