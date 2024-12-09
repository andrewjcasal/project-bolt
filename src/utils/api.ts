export const getApiBaseUrl = () => 
  process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions'
    : 'http://localhost:8888/.netlify/functions'; 