import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuickActions } from '../utils/game/quickActions';
import { Loader2 } from 'lucide-react';
import type { Difficulty } from '../types/game';
import type { TokenMetrics } from '../utils/openai/types';
import type { TokenUsage } from '../utils/tokens/types';
import { validateTokenAvailability } from '../utils/tokens/validation';

interface QuickActionPromptsProps {
  currentPrompt: string;
  onActionSelect: (action: string) => void;
  isDisabled: boolean;
  difficulty?: Difficulty;
  onTokensUsed?: (metrics: TokenMetrics) => void;
  tokenUsage?: TokenUsage;
}

export const QuickActionPrompts: React.FC<QuickActionPromptsProps> = ({
  currentPrompt,
  onActionSelect,
  isDisabled,
  difficulty = 'adaptive',
  onTokensUsed,
  tokenUsage
}) => {
  const [actions, setActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedPrompt, setLastProcessedPrompt] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const loadActions = async () => {
      // Skip if prompt hasn't changed or is empty
      if (!currentPrompt || currentPrompt === lastProcessedPrompt) {
        return;
      }

      // Early token validation
      if (tokenUsage && !validateTokenAvailability(tokenUsage, 'QUICK_ACTIONS')) {
        if (mounted) {
          setActions([]);
        }
        return;
      }
      
      setIsLoading(true);
      try {
        const newActions = await generateQuickActions(
          currentPrompt, 
          difficulty, 
          onTokensUsed,
          tokenUsage
        );
        if (mounted) {
          setActions(newActions);
          setLastProcessedPrompt(currentPrompt);
        }
      } catch (error) {
        console.error('Failed to generate actions:', error);
        if (mounted) {
          setActions([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadActions();

    return () => {
      mounted = false;
    };
  }, [currentPrompt, difficulty, onTokensUsed, tokenUsage, lastProcessedPrompt]);

  const handleActionClick = (action: string) => {
    if (!isDisabled && (!tokenUsage || validateTokenAvailability(tokenUsage, 'STORY_RESPONSE'))) {
      onActionSelect(action);
    }
  };

  if (!actions.length && !isLoading) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 min-h-[32px] justify-center px-2 sm:px-0">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </motion.div>
        ) : (
          actions.map((action, index) => (
            <motion.button
              key={action}
              onClick={() => handleActionClick(action)}
              disabled={isDisabled}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium transition-all duration-200 border
                ${isDisabled 
                  ? 'bg-gray-900/50 border-gray-800/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-800/80'
                }
                rounded-md backdrop-blur-sm shadow-sm hover:shadow-md`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {action}
            </motion.button>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};