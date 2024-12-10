export const TOKEN_REQUIREMENTS = {
  ANTI_CHEAT: 150,
  STORY_RESPONSE: 250,
  QUICK_ACTIONS: 100,
  PROMPT_GENERATION: 150,
  INITIAL_PROMPT: 200
} as const;

export const MINIMUM_TOKENS_REQUIRED = 100;

export const TOKEN_ERROR_MESSAGES = {
  INSUFFICIENT_TOKENS: "You don't have enough energy to continue. Please wait for your daily energy to reset.",
  TOKEN_LIMIT_REACHED: "Daily energy limit reached. Your adventure will continue tomorrow with fresh energy!",
  GENERAL_ERROR: "Something went wrong. Please try again.",
  VALIDATION_ERROR: "Unable to validate your input. Please try again.",
  FETCH_ERROR: "Unable to fetch your energy status. Please try again."
} as const;