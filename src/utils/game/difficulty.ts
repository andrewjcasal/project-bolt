import type { Difficulty } from '../../types/game';

interface DifficultyConfig {
  instructions: string;
  parameters: {
    temperature: number;
    presence_penalty: number;
    frequency_penalty: number;
    max_tokens: number;
  };
}

export const getDifficultyConfig = (difficulty: Difficulty): DifficultyConfig => {
  switch (difficulty) {
    case 'easy':
      return {
        instructions: `
- Provide clear victory paths
- Offer explicit hints
- Forgive some mistakes`,
        parameters: {
          temperature: 0.6,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
          max_tokens: 250
        }
      };

    case 'normal':
      return {
        instructions: `
- Balance challenges with guidance
- Mix explicit and subtle hints
- Moderate consequences for mistakes`,
        parameters: {
          temperature: 0.7,
          presence_penalty: 0.4,
          frequency_penalty: 0.4,
          max_tokens: 250
        }
      };

    case 'challenging':
      return {
        instructions: `
- Present complex challenges
- Offer subtle hints and clues
- Punish mistakes`,
        parameters: {
          temperature: 0.8,
          presence_penalty: 0.5,
          frequency_penalty: 0.5,
          max_tokens: 250
        }
      };

    case 'adaptive':
    default:
      return {
        instructions: `
- Scale difficulty based on user choices
- Adjust hint clarity dynamically
- Increase challenges progressively
- Adapt victory requirements to user performance`,
        parameters: {
          temperature: 0.7,
          presence_penalty: 0.4,
          frequency_penalty: 0.4,
          max_tokens: 250
        }
      };
  }
};