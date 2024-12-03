import { TokenMetrics } from "../../tokens/types";


interface ValidationResponse {
  isValid: boolean;
  reason: string | null;
}

const ANALYSIS_PROMPT = `Analyze the following user input for potential game exploitation attempts.
- Consider Gameplay Flow and Player Intent: Encourage creative exploration by understanding the natural progression and intentions behind user actions.
- Evaluate Alignment with Game Mechanics and Realism: Support innovative choices by ensuring they fit within the game's rules and setting without being overly restrictive.
- Identify and Address Potential Manipulations Thoughtfully: Monitor for efforts to bypass game progression or achieve instant outcomes, balancing vigilance with the acceptance of legitimate, unconventional strategies.
- Monitor for Completion and Manipulation Attempts with Flexibility: Remain alert to attempts that could disrupt the game experience, such as instant completions or system manipulations, while allowing user flexibility in overcoming challenges.

Respond with a JSON object containing:
{
  "isValid": boolean indicating if the input is valid gameplay,
  "reason": string explaining why input was rejected, or null if valid
}`;

export const validateInput = async (
  input: string,
  onTokensUsed?: (metrics: TokenMetrics) => void
): Promise<boolean> => {
  if (!input.trim()) return false;

  try {
    const { completion } = await fetch('http://localhost:3000/api/generate-game-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: ANALYSIS_PROMPT
            },
            {
              role: "user",
              content: `Analyze this input: ${input}`
            }
          ],
          temperature: 0.3,
          max_tokens: 150,
          response_format: { type: "json_object" }
        })
    }).then(response => response.json())

    if (onTokensUsed && completion.usage) {
      onTokensUsed({
        totalTokens: completion.usage.total_tokens,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens
      });
    }

    const content = completion.choices[0].message.content;
    if (!content) return true;

    try {
      const response = JSON.parse(content) as ValidationResponse;
      return response.isValid ?? true;
    } catch (parseError) {
      console.error('Failed to parse validation response:', parseError);
      return true;
    }
  } catch (error) {
    console.error('Validation error:', error);
    return true;
  }
};