const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SMTP_EMAIL',
  'SMTP_PASSWORD',
  'FRONTEND_URL'
];

const sensitiveEnvVars = [
  'OPENROUTER_API_KEY',
  'REDIS_URL'
];

const validateFormat = {
  MONGODB_URI: (val) => val.startsWith('mongodb'),
  SMTP_EMAIL: (val) => val.includes('@'),
  FRONTEND_URL: (val) => val.startsWith('http'),
  JWT_SECRET: (val) => val.length >= 32
};

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }

  // Format validation
  for (const [key, validator] of Object.entries(validateFormat)) {
    if (process.env[key] && !validator(process.env[key])) {
      console.error(`Invalid format for ${key}`);
      process.exit(1);
    }
  }

  console.log('✓ Environment variables validated');
};