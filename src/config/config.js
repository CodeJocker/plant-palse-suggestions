import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  
  // API Endpoints
  openWeatherBaseUrl: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  geminiBaseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  
  // Default coordinates (Kigali, Rwanda)
  defaultLat: parseFloat(process.env.DEFAULT_LAT) || -1.9441,
  defaultLon: parseFloat(process.env.DEFAULT_LON) || 30.0619,
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Rwanda agricultural seasons (approximate dates)
  seasons: {
    shortDry: { start: 'January', end: 'February', description: 'Short dry season' },
    longRains: { start: 'March', end: 'May', description: 'Long rainy season' },
    longDry: { start: 'June', end: 'September', description: 'Long dry season' },
    shortRains: { start: 'October', end: 'December', description: 'Short rainy season' }
  },
  
  // Supported crops with their characteristics
  crops: {
    maize: {
      name: 'Maize',
      waterNeeds: 'high',
      season: 'longRains',
      growthPeriod: '90-120 days'
    },
    beans: {
      name: 'Beans',
      waterNeeds: 'moderate',
      season: 'shortRains',
      growthPeriod: '60-90 days'
    },
    potatoes: {
      name: 'Potatoes',
      waterNeeds: 'moderate',
      season: 'longRains',
      growthPeriod: '90-120 days'
    },
    bananas: {
      name: 'Bananas',
      waterNeeds: 'high',
      season: 'all',
      growthPeriod: '9-12 months'
    }
  },
  
  // Weather thresholds for warnings
  weatherThresholds: {
    temperature: {
      min: 10, // Celsius
      max: 35  // Celsius
    },
    windSpeed: {
      warning: 20, // km/h
      danger: 40   // km/h
    },
    rainfall: {
      light: 2.5,    // mm
      moderate: 7.5, // mm
      heavy: 15      // mm
    }
  }
};

// Validation function to check if required environment variables are set
export const validateConfig = () => {
  const required = ['GEMINI_API_KEY', 'OPENWEATHER_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Some features may not work properly without these keys.');
  }
  
  return missing.length === 0;
};

export default config;
