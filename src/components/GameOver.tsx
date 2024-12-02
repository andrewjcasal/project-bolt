import React from 'react';
import { motion } from 'framer-motion';
import { Skull, RotateCcw } from 'lucide-react';

interface GameOverProps {
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-20 left-0 right-0 px-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl mx-auto bg-black/60 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 text-center"
      >
        <Skull className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h2 className="text-xl font-bold mb-2 text-red-500">Game Over</h2>
        <p className="text-gray-400 mb-3">Your journey has come to an end...</p>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    </motion.div>
  );
};