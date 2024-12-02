import React from 'react';
import { motion } from 'framer-motion';
import { InputArea } from './InputArea';
import type { Difficulty } from '../../types/game';
import type { TokenMetrics } from '../utils/openai/types';
import type { TokenUsage } from '../utils/tokens/types';
import { validateTokenAvailability } from '../utils/tokens/validation';

interface MainPageProps {
  isLoading: boolean;
  isGenerating: boolean;
  onSend: (message: string) => Promise<void>;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onTokensUsed?: (metrics: TokenMetrics) => void;
  tokenUsage?: TokenUsage;
}

export const MainPage: React.FC<MainPageProps> = ({
  isLoading,
  isGenerating,
  onSend,
  difficulty,
  onDifficultyChange,
  onTokensUsed,
  tokenUsage
}) => {
  const canGeneratePrompt = !tokenUsage || validateTokenAvailability(tokenUsage, 'PROMPT_GENERATION');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center text-center px-4 min-h-[100dvh]"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15), transparent 70%)',
        }}
      />
      
      <motion.div 
        className="relative px-4 sm:px-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-[32px] sm:text-[48px] md:text-[56px] font-semibold mb-4 tracking-tight shimmer-text whitespace-nowrap">
          Embarking you on your journey.
        </h1>
      </motion.div>

      <motion.p 
        className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-12 relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Who do you want to be?
      </motion.p>

      <motion.div 
        className="w-full max-w-2xl relative px-4 sm:px-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
        <InputArea 
          onSend={onSend}
          isLoading={isLoading}
          isGenerating={isGenerating}
          placeholder="You choose..."
          showSendIcon={true}
          variant="box"
          showSparkles={true}
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
          onTokensUsed={onTokensUsed}
          tokenUsage={tokenUsage}
          canGeneratePrompt={canGeneratePrompt}
        />
      </motion.div>
    </motion.div>
  );
};