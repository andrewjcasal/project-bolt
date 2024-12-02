import type { DifficultyLevel, DifficultyConfig } from './types';

const difficultyConfigs: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    instructions: `
- Provide clear paths forward
- Offer explicit hints
- Forgive some mistakes`,
    parameters: {
      temperature: 0.6,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
      max_tokens: 250
    },
    narrative: {
      complexity: 0.3,
      detailLevel: 0.5,
      choiceCount: 2,
      hintFrequency: 0.8,
      consequenceSeverity: 0.3
    },
    quickActions: {
      count: 2,
      complexity: 0.3,
      riskLevel: 0.2,
      timeout: 30000
    }
  },
  normal: {
    instructions: `
- Balance challenges with guidance
- Mix explicit and subtle hints
- Moderate consequences for mistakes`,
    parameters: {
      temperature: 0.7,
      presence_penalty: 0.4,
      frequency_penalty: 0.4,
      max_tokens: 250
    },
    narrative: {
      complexity: 0.6,
      detailLevel: 0.7,
      choiceCount: 3,
      hintFrequency: 0.5,
      consequenceSeverity: 0.6
    },
    quickActions: {
      count: 3,
      complexity: 0.6,
      riskLevel: 0.5,
      timeout: 20000
    }
  },
  challenging: {
    instructions: `
- Present complex challenges
- Offer subtle hints and clues
- Punish mistakes`,
    parameters: {
      temperature: 0.8,
      presence_penalty: 0.5,
      frequency_penalty: 0.5,
      max_tokens: 250
    },
    narrative: {
      complexity: 0.9,
      detailLevel: 0.9,
      choiceCount: 4,
      hintFrequency: 0.2,
      consequenceSeverity: 0.9
    },
    quickActions: {
      count: 4,
      complexity: 0.9,
      riskLevel: 0.8,
      timeout: 15000
    }
  },
  adaptive: {
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
    },
    narrative: {
      complexity: 0.5,
      detailLevel: 0.6,
      choiceCount: 3,
      hintFrequency: 0.5,
      consequenceSeverity: 0.5
    },
    quickActions: {
      count: 3,
      complexity: 0.5,
      riskLevel: 0.5,
      timeout: 20000
    }
  }
};

export const getConfig = (difficulty: DifficultyLevel): DifficultyConfig => {
  return difficultyConfigs[difficulty];
};