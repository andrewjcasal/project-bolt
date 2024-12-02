import React from 'react';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const InfoIcon: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="group relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Info className="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-200" />
        </motion.div>
        
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div className="glass-morphism rounded-lg p-4 w-64 shadow-xl">
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>Game is in BETA</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                <span>Keep the story short</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                <span>Do not cheat</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};