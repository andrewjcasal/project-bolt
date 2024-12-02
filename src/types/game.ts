export interface GameState {
  character: string | null;
  narrative: string[];
  status: 'playing' | 'won' | 'lost';
}

export interface Message {
  role: 'assistant';
  content: string;
}

export type Difficulty = 'adaptive' | 'easy' | 'normal' | 'challenging';

export interface GameResponse {
  text: string;
  status: 'playing' | 'won' | 'lost';
}