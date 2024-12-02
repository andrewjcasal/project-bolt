import React from 'react';
import { Battery } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenLimitScreenProps {
  onReturn: () => void;
}

export const TokenLimitScreen: React.FC<TokenLimitScreenProps> = ({ onReturn }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md w-full bg-black/60 border border-red-500/20 rounded-lg p-6 text-center"
      >
        <Battery className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-3 text-red-500">Daily Energy Depleted</h2>
        <p className="text-gray-400 mb-6">
          You've reached your daily energy limit. Your adventure will continue tomorrow with fresh energy!
        </p>
        <button
          onClick={onReturn}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors duration-200"
        >
          Back to Main Page
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Energy resets at midnight UTC
        </p>
      </motion.div>
    </motion.div>
  );
};