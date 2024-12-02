import React, { useState } from 'react';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AudioState, AudioControls as AudioControlsType } from '../utils/audio/types';

interface AudioControlsProps extends AudioState, AudioControlsType {}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isMuted,
  volume,
  isLoaded,
  error,
  onMuteToggle,
  onVolumeChange,
  retryLoading
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="fixed bottom-4 right-12 flex flex-col items-center z-50 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 overflow-hidden bg-transparent"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="h-24 accent-gray-400 appearance-none bg-transparent cursor-pointer"
              style={{
                writingMode: 'bt-lr',
                WebkitAppearance: 'slider-vertical'
              }}
              aria-label="Volume control"
              disabled={!isLoaded}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {error ? (
        <motion.button
          onClick={retryLoading}
          className="text-red-400 hover:text-red-300 transition-colors duration-200 bg-transparent"
          aria-label="Retry loading audio"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      ) : (
        <motion.button
          onClick={onMuteToggle}
          className="text-gray-400 hover:text-white transition-colors duration-200 bg-transparent p-0"
          aria-label={isMuted ? "Unmute" : "Mute"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isLoaded}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
      )}
    </motion.div>
  );
};