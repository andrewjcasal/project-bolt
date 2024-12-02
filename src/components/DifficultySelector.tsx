import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Difficulty } from '../types/game';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onDifficultyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'adaptive', label: 'Adaptive' },
    { value: 'easy', label: 'Easy' },
    { value: 'normal', label: 'Normal' },
    { value: 'challenging', label: 'Challenging' },
  ];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDifficultySelect = (e: React.MouseEvent, value: Difficulty) => {
    e.preventDefault();
    e.stopPropagation();
    onDifficultyChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Difficulty Settings"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClick}
            />
            <motion.div
              className="absolute bottom-full right-0 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-gray-800 rounded-lg shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {difficulties.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={(e) => handleDifficultySelect(e, value)}
                  className={`w-full px-4 py-2 text-sm text-left transition-colors duration-200
                    ${currentDifficulty === value
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                >
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};