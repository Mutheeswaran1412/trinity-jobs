export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'ZyncJobs',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  FEATURES: {
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    CHAT: import.meta.env.VITE_ENABLE_CHAT === 'true',
    AI: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true'
  }
};