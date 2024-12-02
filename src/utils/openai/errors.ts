export class OpenAIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export const createOpenAIError = (error: any): OpenAIError => {
  const status = error?.response?.status;
  const code = error?.code;
  const message = error?.response?.data?.error?.message || error?.message;

  switch (status) {
    case 401:
      return new OpenAIError('Invalid API key or authentication failed', status, code);
    case 429:
      return new OpenAIError('Rate limit exceeded. Please try again later', status, code);
    case 500:
      return new OpenAIError('OpenAI service error. Please try again later', status, code);
    default:
      return new OpenAIError(
        message || 'An unexpected error occurred with the OpenAI service',
        status,
        code
      );
  }
};