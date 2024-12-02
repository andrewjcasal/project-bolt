import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePrompt } from '../utils/game';
import { DifficultySelector } from './DifficultySelector';
import { validateTokenAvailability } from '../utils/tokens/validation';
import type { Difficulty } from '../types/game';
import type { TokenMetrics } from '../utils/openai/types';
import type { TokenUsage } from '../utils/tokens/types';

const MAX_CHARS = 280;

interface InputAreaProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  placeholder?: string;
  showSendIcon?: boolean;
  variant?: 'box' | 'line';
  showSparkles?: boolean;
  difficulty?: Difficulty;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  onTokensUsed?: (metrics: TokenMetrics) => void;
  tokenUsage?: TokenUsage;
  canGeneratePrompt?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  isLoading,
  isGenerating,
  placeholder = "Type your message...",
  showSendIcon = true,
  variant = 'box',
  showSparkles = false,
  difficulty = 'adaptive',
  onDifficultyChange,
  onTokensUsed,
  tokenUsage,
  canGeneratePrompt = true
}) => {
  const [input, setInput] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [fullPrompt, setFullPrompt] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isTyping && currentIndex < fullPrompt.length) {
      const timeout = setTimeout(() => {
        const nextIndex = Math.min(currentIndex + 2, fullPrompt.length);
        setInput(fullPrompt.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, 30);

      return () => clearTimeout(timeout);
    } else if (currentIndex >= fullPrompt.length && fullPrompt) {
      setIsTyping(false);
      setCurrentIndex(0);
      setFullPrompt('');
    }
  }, [currentIndex, fullPrompt, isTyping]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (trimmedInput && !isLoading && !isGenerating && !isTyping) {
      // Check if we have enough tokens before sending
      if (tokenUsage && !validateTokenAvailability(tokenUsage, 'INITIAL_PROMPT')) {
        return;
      }
      onSend(trimmedInput);
      setInput('');
      setFullPrompt('');
    }
  }, [input, isLoading, isGenerating, isTyping, onSend, tokenUsage]);

  const handleGeneratePrompt = useCallback(async () => {
    if (isGeneratingPrompt || isLoading || isGenerating || isTyping) return;
    
    // Check if we have enough tokens before generating
    if (tokenUsage && !validateTokenAvailability(tokenUsage, 'PROMPT_GENERATION')) {
      return;
    }
    
    setIsGeneratingPrompt(true);
    try {
      const prompt = await generatePrompt(difficulty, onTokensUsed, tokenUsage);
      setFullPrompt(prompt);
      setInput('');
      setCurrentIndex(0);
      setIsTyping(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [isGeneratingPrompt, isLoading, isGenerating, isTyping, difficulty, onTokensUsed, tokenUsage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTyping) {
      const value = e.target.value;
      if (value.length <= MAX_CHARS) {
        setInput(value);
      }
    }
  };

  const hasEnoughTokens = !tokenUsage || validateTokenAvailability(tokenUsage, showSparkles ? 'PROMPT_GENERATION' : 'INITIAL_PROMPT');

  const inputClasses = variant === 'box'
    ? "w-full resize-none input-gradient border border-gray-800 rounded-2xl py-3 px-12 min-h-[48px] focus:outline-none focus:border-gray-600 text-white text-lg placeholder-gray-500 shadow-lg transition-colors duration-200"
    : "w-full resize-none bg-transparent border-b border-gray-800 py-3 px-12 min-h-[48px] focus:outline-none focus:border-gray-600 text-white text-lg placeholder-gray-600 transition-colors duration-200";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex items-center">
        {showSparkles && onDifficultyChange && (
          <div className="absolute -left-10 top-1/2 -translate-y-1/2">
            <DifficultySelector
              currentDifficulty={difficulty}
              onDifficultyChange={onDifficultyChange}
            />
          </div>
        )}

        {showSparkles && (
          <AnimatePresence mode="wait">
            <motion.button
              key={isGeneratingPrompt ? 'generating' : 'normal'}
              type="button"
              onClick={handleGeneratePrompt}
              disabled={isLoading || isGenerating || isGeneratingPrompt || isTyping || !hasEnoughTokens}
              className={`absolute left-3.5 flex items-center justify-center w-6 h-6
                ${!isGeneratingPrompt && !isLoading && !isGenerating && !isTyping && hasEnoughTokens ? 'text-blue-400 hover:text-blue-300' : 'text-gray-600'}
                transition-colors duration-200
                ${(isLoading || isGenerating || isGeneratingPrompt || isTyping || !hasEnoughTokens) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              initial={{ rotate: 0 }}
              animate={{ rotate: isGeneratingPrompt ? 360 : 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </AnimatePresence>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className={inputClasses}
          disabled={isLoading || isGenerating || isTyping || !hasEnoughTokens}
          style={{ overflow: 'hidden' }}
        />

        {showSendIcon && (
          <button
            type="submit"
            disabled={isLoading || isGenerating || !input.trim() || isTyping || !hasEnoughTokens}
            className={`absolute right-3.5 flex items-center justify-center w-6 h-6
              ${input.trim() && !isLoading && !isGenerating && !isTyping && hasEnoughTokens ? 'text-gray-400 hover:text-white' : 'text-gray-600'}
              transition-colors duration-200
              ${(!input.trim() || isLoading || isGenerating || isTyping || !hasEnoughTokens) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </motion.form>
  );
};