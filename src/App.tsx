import React, { useCallback, useEffect, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useTokens } from './hooks/useTokens';
import { AnimatePresence } from 'framer-motion';
import { MainPage } from './components/MainPage';
import { GamePage } from './components/GamePage';
import { Victory } from './components/Victory';
import { GameOver } from './components/GameOver';
import { AudioControls } from './components/AudioControls';
import { InfoIcon } from './components/InfoIcon';
import { TokenCounter } from './components/TokenCounter';
import { TokenLimitModal } from './components/TokenLimitModal';
import { validateTokenAvailability } from './utils/tokens/validation';
import type { TokenMetrics } from './utils/openai/types';

export default function App() {
  const { usage, updateTokens, hasTokens } = useTokens();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleTokensUsed = useCallback(async (metrics: TokenMetrics) => {
    try {
      const success = await updateTokens({
        total: metrics.totalTokens,
        conversation: metrics.totalTokens,
        timestamp: Date.now()
      });

      if (!success) {
        setShowLimitModal(true);
        throw new Error('Token limit exceeded');
      }
    } catch (error) {
      setShowLimitModal(true);
      throw error;
    }
  }, [updateTokens]);

  const { 
    messages, 
    isLoading, 
    isGenerating, 
    processMessage, 
    gameState, 
    resetGame, 
    onTypewriterComplete,
    difficulty,
    setDifficulty
  } = useGameState(handleTokensUsed, usage);

  const { 
    isMuted, 
    volume, 
    isLoaded, 
    error, 
    toggleMute, 
    adjustVolume, 
    startMusic, 
    retryLoading 
  } = useAudio();

  const hasCharacter = gameState.character !== null;

  useEffect(() => {
    startMusic();
  }, [startMusic]);

  const handleMessage = useCallback((message: string) => {
    // Check if we have enough tokens for initial prompt
    if (!validateTokenAvailability(usage, 'INITIAL_PROMPT')) {
      setShowLimitModal(true);
      return;
    }

    if (!hasTokens) {
      setShowLimitModal(true);
      return;
    }
    processMessage(message);
  }, [hasTokens, processMessage, usage]);

  const handleReturnToMain = useCallback(() => {
    resetGame();
    setShowLimitModal(false);
  }, [resetGame]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark opacity-80" />
      
      <AudioControls
        isMuted={isMuted}
        volume={volume}
        isLoaded={isLoaded}
        error={error}
        onMuteToggle={toggleMute}
        onVolumeChange={adjustVolume}
        retryLoading={retryLoading}
      />
      
      <TokenCounter usage={usage} />
      
      <div className="relative flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
        <AnimatePresence mode="wait">
          {showLimitModal && (
            <TokenLimitModal onReturn={handleReturnToMain} />
          )}
          
          {!hasCharacter ? (
            <MainPage
              key="main-page"
              isLoading={isLoading}
              isGenerating={isGenerating}
              onSend={handleMessage}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              onTokensUsed={handleTokensUsed}
              tokenUsage={usage}
            />
          ) : (
            <>
              <GamePage
                key="game-page"
                messages={messages}
                isLoading={isLoading}
                isGenerating={isGenerating}
                onSend={handleMessage}
                onTypewriterComplete={onTypewriterComplete}
                gameStatus={gameState.status}
                difficulty={difficulty}
                tokenUsage={usage}
                onReturnToMain={handleReturnToMain}
              />
              <AnimatePresence>
                {gameState.status === 'won' && (
                  <Victory onRestart={resetGame} />
                )}
                {gameState.status === 'lost' && (
                  <GameOver onRestart={resetGame} />
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
      </div>
      
      <InfoIcon />
    </div>
  );
}