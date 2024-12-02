import type { DifficultyLevel, DifficultyState, DifficultyConfig } from './types';
import { getConfig } from './config';

const DIFFICULTY_STORAGE_KEY = 'game-difficulty-state';

export class DifficultyManager {
  private state: DifficultyState;
  private static instance: DifficultyManager;

  private constructor() {
    const savedState = this.loadState();
    this.state = savedState || {
      current: 'adaptive',
      previousChoices: [],
      adaptiveScore: 0,
      performanceMetrics: {
        successRate: 0.5,
        averageTimePerAction: 0,
        riskTaken: 0.5
      }
    };
  }

  static getInstance(): DifficultyManager {
    if (!DifficultyManager.instance) {
      DifficultyManager.instance = new DifficultyManager();
    }
    return DifficultyManager.instance;
  }

  private loadState(): DifficultyState | null {
    try {
      const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading difficulty state:', error);
      return null;
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving difficulty state:', error);
    }
  }

  getCurrentDifficulty(): DifficultyLevel {
    return this.state.current;
  }

  setDifficulty(difficulty: DifficultyLevel): void {
    this.state.current = difficulty;
    this.state.adaptiveScore = 0;
    this.state.previousChoices = [];
    this.state.performanceMetrics = {
      successRate: 0.5,
      averageTimePerAction: 0,
      riskTaken: 0.5
    };
    this.saveState();
  }

  getConfig(): DifficultyConfig {
    const baseConfig = getConfig(this.state.current);
    
    if (this.state.current === 'adaptive') {
      return this.adjustConfigBasedOnPerformance(baseConfig);
    }
    
    return baseConfig;
  }

  updatePerformanceMetrics(metrics: {
    success?: boolean;
    actionTime?: number;
    riskLevel?: number;
  }): void {
    const { success, actionTime, riskLevel } = metrics;
    const { performanceMetrics } = this.state;

    if (success !== undefined) {
      performanceMetrics.successRate = 
        performanceMetrics.successRate * 0.7 + (success ? 0.3 : 0);
    }

    if (actionTime !== undefined) {
      performanceMetrics.averageTimePerAction = 
        performanceMetrics.averageTimePerAction * 0.7 + actionTime * 0.3;
    }

    if (riskLevel !== undefined) {
      performanceMetrics.riskTaken = 
        performanceMetrics.riskTaken * 0.7 + riskLevel * 0.3;
    }

    this.adjustAdaptiveDifficulty();
    this.saveState();
  }

  private adjustConfigBasedOnPerformance(config: DifficultyConfig): DifficultyConfig {
    const { performanceMetrics } = this.state;
    const adjustedConfig = { ...config };

    // Adjust narrative complexity based on success rate
    adjustedConfig.narrative.complexity = 
      this.lerp(0.3, 0.9, performanceMetrics.successRate);

    // Adjust quick actions based on average response time
    const timeScore = Math.max(0, Math.min(1, 
      1 - (performanceMetrics.averageTimePerAction / 30000)
    ));
    adjustedConfig.quickActions.timeout = 
      this.lerp(30000, 15000, timeScore);

    // Adjust risk levels based on player's risk-taking behavior
    adjustedConfig.quickActions.riskLevel = 
      this.lerp(0.2, 0.8, performanceMetrics.riskTaken);

    return adjustedConfig;
  }

  private adjustAdaptiveDifficulty(): void {
    if (this.state.current !== 'adaptive') return;

    const { performanceMetrics } = this.state;
    const difficultyScore = 
      (performanceMetrics.successRate * 0.5) +
      (performanceMetrics.riskTaken * 0.3) +
      ((1 - performanceMetrics.averageTimePerAction / 30000) * 0.2);

    this.state.adaptiveScore = difficultyScore;
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Math.max(0, Math.min(1, t));
  }
}