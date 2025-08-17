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
  
  // Supported crops with enhanced characteristics
  crops: {
    maize: {
      name: 'Maize',
      waterNeeds: 'high',
      season: 'longRains',
      growthPeriod: '90-120 days',
      soilPh: { min: 5.5, max: 7.5, optimal: 6.5 },
      growthStates: ['germination', 'vegetative', 'flowering', 'fruiting'],
      varieties: {
        'hybrid_maize': { description: 'High-yield hybrid varieties', droughtResistance: 'moderate' },
        'local_maize': { description: 'Traditional local varieties', droughtResistance: 'high' },
        'sweet_corn': { description: 'Sweet corn varieties', droughtResistance: 'low' }
      }
    },
    beans: {
      name: 'Beans',
      waterNeeds: 'moderate',
      season: 'shortRains',
      growthPeriod: '60-90 days',
      soilPh: { min: 6.0, max: 7.5, optimal: 6.8 },
      growthStates: ['germination', 'vegetative', 'flowering', 'fruiting'],
      varieties: {
        'climbing_beans': { description: 'Climbing bean varieties', droughtResistance: 'moderate' },
        'bush_beans': { description: 'Bush bean varieties', droughtResistance: 'high' },
        'kidney_beans': { description: 'Kidney bean varieties', droughtResistance: 'moderate' }
      }
    },
    potatoes: {
      name: 'Potatoes',
      waterNeeds: 'moderate',
      season: 'longRains',
      growthPeriod: '90-120 days',
      soilPh: { min: 5.0, max: 6.5, optimal: 5.8 },
      growthStates: ['germination', 'vegetative', 'flowering', 'fruiting'],
      varieties: {
        'irish_potato': { description: 'Traditional Irish potato', droughtResistance: 'moderate' },
        'sweet_potato': { description: 'Sweet potato varieties', droughtResistance: 'high' },
        'new_potato': { description: 'Early maturing varieties', droughtResistance: 'moderate' }
      }
    },
    bananas: {
      name: 'Bananas',
      waterNeeds: 'high',
      season: 'all',
      growthPeriod: '9-12 months',
      soilPh: { min: 5.5, max: 7.0, optimal: 6.2 },
      growthStates: ['germination', 'vegetative', 'flowering', 'fruiting'],
      varieties: {
        'cavendish': { description: 'Cavendish banana variety', droughtResistance: 'moderate' },
        'plantain': { description: 'Plantain varieties', droughtResistance: 'high' },
        'lady_finger': { description: 'Lady finger banana', droughtResistance: 'low' }
      }
    }
  },
  
  // Growth states with descriptions
  growthStates: {
    germination: { description: 'Seed germination and early seedling stage', duration: '7-14 days' },
    vegetative: { description: 'Active growth of leaves and stems', duration: '30-60 days' },
    flowering: { description: 'Flower development and pollination', duration: '7-21 days' },
    fruiting: { description: 'Fruit development and maturation', duration: '30-90 days' }
  },
  
  // Soil pH categories
  soilPhCategories: {
    very_acidic: { range: '4.0-5.0', description: 'Very acidic soil, may need lime application' },
    acidic: { range: '5.1-6.0', description: 'Acidic soil, suitable for acid-loving crops' },
    slightly_acidic: { range: '6.1-6.5', description: 'Slightly acidic, good for most crops' },
    neutral: { range: '6.6-7.3', description: 'Neutral pH, optimal for most crops' },
    slightly_alkaline: { range: '7.4-7.8', description: 'Slightly alkaline, may need acidification' },
    alkaline: { range: '7.9-8.5', description: 'Alkaline soil, may limit nutrient availability' }
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
