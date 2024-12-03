import { validateInput } from './anticheat';
import { SYSTEM_PROMPT, PROMPT_TEMPLATE, DEFAULT_PROMPT } from './constants';
import { getDifficultyConfig } from './difficulty';
import type { GameResponse, Difficulty } from '../../types/game';

export const generatePrompt = async (difficulty: Difficulty = 'adaptive'): Promise<string> => {
  try {
    const config = getDifficultyConfig(difficulty);
    
    const { completion } = await fetch('http://localhost:3000/api/generate-game-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: "system",
            content: PROMPT_TEMPLATE
          }],
          ...config.parameters
        })
    }).then(response => response.json())

    return completion.choices[0].message.content || DEFAULT_PROMPT;
  } catch (error) {
    console.error('Error generating prompt:', error);
    return DEFAULT_PROMPT;
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
    const config = getDifficultyConfig(difficulty);
    
    const { completion } = await fetch('http://localhost:3000/api/generate-game-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `${SYSTEM_PROMPT}\n\n${config.instructions}`
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
          ...config.parameters
        })
    }).then(response => response.json())

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