import { validateInput } from './anticheat';
import type { GameResponse, Difficulty } from '../../types/game';

interface Messages {
  role: string;
  content: string;
}

interface Config {
  parameters?: Record<string, any>;
  instructions?: string;
}

export const generatePrompt = async (messages: Messages[], config: Config = {}) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions'
    : 'http://localhost:8888/.netlify/functions';

  try {
    const response = await fetch(`${baseUrl}/generate-game-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messages,
        config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
};

export const generateAIResponse = async (
  prompt: string,
  context?: string,
  difficulty: Difficulty = 'adaptive'
): Promise<GameResponse> => {
  // Validate input first
  const isValid = await validateInput(prompt);
  if (!isValid) {
    return {
      text: "Your action seems to conflict with the natural flow of the story. What would you like to try instead?",
      status: 'playing'
    };
  }

  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? '/.netlify/functions'
      : 'http://localhost:8888/.netlify/functions';

    const { completion } = await fetch(`${baseUrl}/generate-game-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `${difficulty === 'adaptive' ? 'Adaptive mode' : difficulty} difficulty`
          },
          ...(context ? [{
            role: "assistant",
            content: context
          }] : []),
          {
            role: "user",
            content: prompt
          }
        ],
      })
    }).then(response => response.json());

    const text = completion.choices[0].message.content || "Something went wrong. Please try again.";
    
    const isVictory = text.includes("You have successfully completed your quest");
    const isDefeat = text.includes("You have ultimately failed in your quest");
    
    return {
      text,
      status: isVictory ? 'won' : isDefeat ? 'lost' : 'playing'
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      text: "Something went wrong. Please try again.",
      status: 'playing'
    };
  }
};