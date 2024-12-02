import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  onComplete: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const charsPerTick = 2;

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    if (!text) {
      setIsComplete(true);
      onComplete();
      return;
    }

    let currentIndex = 0;
    const textLength = text.length;

    const typeNextChunk = () => {
      if (currentIndex < textLength) {
        const nextIndex = Math.min(currentIndex + charsPerTick, textLength);
        setDisplayedText(text.slice(0, nextIndex));
        currentIndex = nextIndex;
        
        const delay = text[currentIndex - 1] === '.' ? 60 : 20;
        timeoutRef.current = setTimeout(typeNextChunk, delay);
      } else {
        setIsComplete(true);
        onComplete();
      }
    };

    timeoutRef.current = setTimeout(typeNextChunk, 20);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="message-appear"
    >
      <p className="text-lg leading-relaxed text-gray-100">
        {displayedText}
        {!isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block ml-0.5 text-blue-400 text-glow"
          >
            ▋
          </motion.span>
        )}
      </p>
    </motion.div>
  );
};