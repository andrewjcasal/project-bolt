export type DifficultyLevel = 'adaptive' | 'easy' | 'normal' | 'challenging';

export interface DifficultyConfig {
  instructions: string;
  parameters: {
    temperature: number;
    presence_penalty: number;
    frequency_penalty: number;
    max_tokens: number;
  };
  narrative: {
    complexity: number;
    detailLevel: number;
    choiceCount: number;
    hintFrequency: number;
    consequenceSeverity: number;
  };
  quickActions: {
    count: number;
    complexity: number;
    riskLevel: number;
    timeout: number;
  };
}

export interface DifficultyState {
  current: DifficultyLevel;
  previousChoices: string[];
  adaptiveScore: number;
  performanceMetrics: {
    successRate: number;
    averageTimePerAction: number;
    riskTaken: number;
  };
}