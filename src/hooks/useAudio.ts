import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioManager } from '../utils/audio/AudioManager';
import { VOLUME } from '../utils/audio/constants';
import type { AudioState, AudioControls } from '../utils/audio/types';

export const useAudio = (): AudioState & AudioControls => {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(VOLUME.DEFAULT);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioManager = useRef<AudioManager>(AudioManager.getInstance());

  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioManager.current.initialize();
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load audio');
        setIsLoaded(false);
      }
    };

    initAudio();

    return () => {
      audioManager.current.cleanup();
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      audioManager.current.setVolume(volume, isMuted);
    }
  }, [volume, isMuted, isLoaded]);

  const toggleMute = useCallback(() => {
    if (!isLoaded) return;

    setIsMuted(prevMuted => {
      if (prevMuted) {
        const targetVolume = volume === 0 ? audioManager.current.getPreviousVolume() : volume;
        if (targetVolume > 0) {
          setVolume(targetVolume);
        }
      }
      return !prevMuted;
    });
  }, [isLoaded, volume]);

  const adjustVolume = useCallback((newVolume: number) => {
    if (!isLoaded) return;
    
    const clampedVolume = Math.max(VOLUME.MIN, Math.min(newVolume, VOLUME.MAX));
    
    if (clampedVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    
    setVolume(clampedVolume);
  }, [isLoaded, isMuted]);

  const startMusic = useCallback(() => {
    if (!isLoaded || isMuted || volume === 0) return;
    audioManager.current.setVolume(volume, false);
  }, [isLoaded, isMuted, volume]);

  const retryLoading = useCallback(async () => {
    setError(null);
    try {
      await audioManager.current.initialize();
      setIsLoaded(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load audio');
    }
  }, []);

  return {
    isMuted: isMuted || volume === 0,
    volume,
    isLoaded,
    error,
    toggleMute,
    adjustVolume,
    startMusic,
    retryLoading
  };
};