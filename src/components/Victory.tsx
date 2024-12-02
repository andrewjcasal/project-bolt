import React, { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import ReactCanvasConfetti from 'react-canvas-confetti';

interface VictoryProps {
  onRestart: () => void;
}

export const Victory: React.FC<VictoryProps> = ({ onRestart }) => {
  const refAnimationInstance = useRef<any>(null);
  const hasPlayedConfetti = useRef(false);

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current?.({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio),
    });
  }, []);

  const fire = useCallback(() => {
    if (hasPlayedConfetti.current) return;
    
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    hasPlayedConfetti.current = true;
  }, [makeShot]);

  useEffect(() => {
    fire();
  }, [fire]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-20 left-0 right-0 px-4"
    >
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl mx-auto bg-black/60 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4 text-center"
      >
        <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <h2 className="text-xl font-bold mb-2 text-yellow-500">Victory!</h2>
        <p className="text-gray-400 mb-3">Congratulations on completing your journey...</p>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Play Again
        </button>
      </motion.div>
    </motion.div>
  );
};