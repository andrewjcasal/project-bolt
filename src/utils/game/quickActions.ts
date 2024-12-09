import { DifficultyManager } from './difficulty/manager';
import { validateTokenAvailability } from '../tokens/validation';
import type { Difficulty } from '../../types/game';
import type { TokenMetrics, TokenUsage } from '../tokens/types';
import { getApiBaseUrl } from '../api';

const getQuickActionsPrompt = (difficulty: Difficulty) => {
  const basePrompt = `Analyze the current narrative context and generate 1-3 relevant action suggestions. The number of actions should be based on the context.

Guidelines:
- Keep each action brief (2-4 words)
- Vary approaches (observation, interaction, movement)
- Format response as JSON: { "Actions": ["Action1", "Action2", "Action3"] }`;

  switch (difficulty) {
    case 'easy':
      return `${basePrompt}\n\nFocus on clear, safe actions with obvious outcomes.`;
    case 'normal':
      return `${basePrompt}\n\nBalance safe and moderately risky actions.`;
    case 'challenging':
      return `${basePrompt}\n\nEmphasize strategic and potentially risky options.`;
    case 'adaptive':
      const difficultyManager = DifficultyManager.getInstance();
      const config = difficultyManager.getConfig();
      const adaptivePrompt = `${basePrompt}\n\nAdaptive Mode Guidelines:
- Complexity Level: ${Math.round(config.narrative.complexity * 100)}%
- Risk Level: ${Math.round(config.quickActions.riskLevel * 100)}%
- Suggested Actions: ${config.quickActions.count}
- Adjust action complexity and risk based on user performance
- Scale challenge level progressively with success`;
      return adaptivePrompt;
    default:
      return basePrompt;
  }
};

const DEFAULT_ACTIONS: string[] = [];

let lastNarrativeContext = '';
let cachedActions: string[] = [];

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse API response:', text);
    throw new Error('Invalid API response format');
  }
};

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

export const generateQuickActions = async (
  narrativeContext: string,
  difficulty: Difficulty = 'adaptive',
  onTokensUsed?: (metrics: TokenMetrics) => void,
  tokenUsage?: TokenUsage
): Promise<string[]> => {
  if (!narrativeContext) return DEFAULT_ACTIONS;

  if (narrativeContext === lastNarrativeContext && cachedActions.length > 0) {
    return cachedActions;
  }

  try {
    if (tokenUsage && !validateTokenAvailability(tokenUsage, 'QUICK_ACTIONS')) {
      console.warn('Insufficient tokens for quick actions generation');
      return DEFAULT_ACTIONS;
    }

    const response = await fetch(`${getApiBaseUrl()}/generate-game-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: getQuickActionsPrompt(difficulty)
          },
          {
            role: "user",
            content: `Current narrative: ${narrativeContext}\n\nRespond with JSON containing contextually appropriate actions (1-3) in the format: { "Actions": ["Action1", "Action2", "Action3"] }`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
        response_format: { type: "json_object" }
      })
    });

    const data = await handleApiResponse(response);
    
    if (!data?.completion?.choices?.[0]?.message?.content) {
      console.warn('Invalid API response structure:', data);
      return DEFAULT_ACTIONS;
    }

    await updateTokenUsage(data.completion, onTokensUsed);

    try {
      const content = data.completion.choices[0].message.content;
      const response = JSON.parse(content);
      
      if (!response.Actions || !Array.isArray(response.Actions) || response.Actions.length === 0) {
        console.warn('Invalid quick actions response format:', content);
        return DEFAULT_ACTIONS;
      }

      const formattedActions = response.Actions.map(
        action => action.charAt(0).toUpperCase() + action.slice(1)
      );

      lastNarrativeContext = narrativeContext;
      cachedActions = formattedActions;

      return formattedActions;
    } catch (parseError) {
      console.error('Failed to parse quick actions response:', parseError);
      return DEFAULT_ACTIONS;
    }
  } catch (error) {
    console.error('Error generating quick actions:', error);
    if (error instanceof Error && error.message.includes('Insufficient tokens')) {
      return DEFAULT_ACTIONS;
    }
    return DEFAULT_ACTIONS;
  }
};

export const clearQuickActionsCache = () => {
  lastNarrativeContext = '';
  cachedActions = [];
};