import { useState, useCallback } from 'react';
import { GameState, Message } from '../types/game';
import { generateAIResponse } from '../utils/game';
import { DifficultyManager } from '../utils/game/difficulty/manager';
import { clearQuickActionsCache } from '../utils/game/quickActions';
import type { DifficultyLevel } from '../utils/game/difficulty/types';
import type { TokenMetrics, TokenUsage } from '../utils/tokens/types';
import { TOKEN_ERROR_MESSAGES } from '../utils/tokens/constants';

const initialState: GameState = {
  character: null,
  narrative: [],
  status: 'playing'
};

export const useGameState = (
  onTokensUsed?: (metrics: TokenMetrics) => void,
  tokenUsage?: TokenUsage
) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const difficultyManager = DifficultyManager.getInstance();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    difficultyManager.getCurrentDifficulty()
  );

  const updateDifficulty = useCallback((newDifficulty: DifficultyLevel) => {
    difficultyManager.setDifficulty(newDifficulty);
    setDifficulty(newDifficulty);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialState);
    setMessages([]);
    setIsLoading(false);
    setIsGenerating(false);
    clearQuickActionsCache(); // Clear quick actions cache on reset
  }, []);

  const onTypewriterComplete = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const processMessage = useCallback(async (userMessage: string) => {
    if (isLoading || isGenerating) return;
    
    try {
      setIsLoading(true);
      setIsGenerating(true);
      
      const narrativeContext = gameState.narrative.join('\n');
      const response = await generateAIResponse(
        userMessage, 
        narrativeContext, 
        difficulty,
        onTokensUsed,
        tokenUsage
      );
      
      setIsLoading(false);

      if (response.text.includes("conflict with the natural flow")) {
        setMessages([{
          role: 'assistant',
          content: response.text
        }]);
        setIsGenerating(false);
        return;
      }

      const newMessage = {
        role: 'assistant' as const,
        content: response.text
      };

      setMessages([newMessage]);

      if (!gameState.character) {
        setGameState({
          character: userMessage,
          narrative: [response.text],
          status: response.status
        });
      } else {
        setGameState(prev => ({
          ...prev,
          narrative: [...prev.narrative, response.text],
          status: response.status
        }));
      }

    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setIsGenerating(false);
      setMessages([{
        role: 'assistant',
        content: error instanceof Error && error.message.includes('Insufficient tokens')
          ? TOKEN_ERROR_MESSAGES.INSUFFICIENT_TOKENS
          : TOKEN_ERROR_MESSAGES.GENERAL_ERROR
      }]);
    }
  }, [gameState, isLoading, isGenerating, difficulty, onTokensUsed, tokenUsage]);

  return {
    gameState,
    messages,
    isLoading,
    isGenerating,
    difficulty,
    processMessage,
    resetGame,
    onTypewriterComplete,
    setDifficulty: updateDifficulty
  };
};