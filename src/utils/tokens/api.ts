import { getApiBaseUrl } from '../api';

export const getTokenUsage = async (deviceId: string) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/token-usage/${deviceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token usage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching token usage:', error);
    throw error;
  }
};

export const updateTokenUsage = async (deviceId: string, tokens: number) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/token-usage/${deviceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ tokens }),
    });

    if (!response.ok) {
      throw new Error('Failed to update token usage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating token usage:', error);
    throw error;
  }
};