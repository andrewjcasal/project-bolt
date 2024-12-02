export interface AudioState {
  isMuted: boolean;
  volume: number;
  isLoaded: boolean;
  error: string | null;
}

export interface AudioControls {
  toggleMute: () => void;
  adjustVolume: (volume: number) => void;
  startMusic: () => void;
  retryLoading: () => void;
}