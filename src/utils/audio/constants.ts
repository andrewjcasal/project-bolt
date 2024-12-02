export const AUDIO_TRACKS = {
  // Primary track: "Ambient Piano" - soft, minimal piano with gentle pads
  AMBIENT: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=relaxing-145038.mp3',
  // Fallback track: "Calm Meditation" - peaceful ambient texture
  FALLBACK: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-112191.mp3'
} as const;

export const VOLUME = {
  DEFAULT: 0.15,
  MIN: 0,
  MAX: 1
} as const;

export const FADE_DURATION = 1000; // ms