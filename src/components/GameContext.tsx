import React from 'react';
import { GameState } from '../types/game';
import { Shield, Sword, Heart, Star } from 'lucide-react';

interface GameContextProps {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  gameState: GameState;
}

export const GameContext: React.FC<GameContextProps> = ({ messages, gameState }) => {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-lg" />
      <div className="relative backdrop-blur-sm bg-black/40 p-6 rounded-lg border border-gray-800">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Adventure Status</h2>
          {gameState.character && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{gameState.character}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm">{gameState.health}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{gameState.experience}</span>
              </div>
            </div>
          )}
        </div>
        <p className="text-gray-300">
          {messages[messages.length - 1]?.content || "Begin your adventure..."}
        </p>
      </div>
    </div>
  );
};