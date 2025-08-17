import weatherService from './weatherService.js';
import geminiService from './geminiService.js';
import { 
  detectCurrentSeason, 
  summarizeForecast, 
  generateWeatherWarnings,
  validateCoordinates,
  getDefaultCoordinates
} from '../utils/weatherUtils.js';
import { 
  validateCropType, 
  generateBasicSeasonalAdvice 
} from '../utils/cropUtils.js';

/**
 * Main service for generating farming advice
 */
class AdviceService {
  constructor() {
    this.weatherService = weatherService;
    this.geminiService = geminiService;
  }
  
  /**
   * Generate comprehensive farming advice
   * @param {Object} options - Request options
   * @param {number} options.lat - Latitude (optional, defaults to Kigali)
   * @param {number} options.lon - Longitude (optional, defaults to Kigali)
   * @param {string} options.crop - Crop type (required)
   * @param {boolean} options.useAI - Whether to use AI (defaults to true)
   * @returns {Promise<Object>} Comprehensive farming advice
   */
  async generateAdvice(options = {}) {
    try {
      // Validate and set default coordinates
      const { lat, lon } = this.validateAndSetCoordinates(options.lat, options.lon);
      
      // Validate crop type
      if (!options.crop) {
        throw new Error('Crop type is required');
      }
      
      const cropType = options.crop.toLowerCase();
      if (!validateCropType(cropType)) {
        throw new Error(`Unsupported crop type: ${cropType}. Supported crops: maize, beans, potatoes, bananas`);
      }
      
      // Detect current season
      const seasonInfo = detectCurrentSeason();
      
      // Fetch weather forecast
      let forecastData;
      let forecastSummary;
      let weatherWarnings = [];
      
      try {
        forecastData = await this.weatherService.getForecast(lat, lon);
        forecastSummary = summarizeForecast(forecastData);
        weatherWarnings = generateWeatherWarnings(forecastSummary);
      } catch (weatherError) {
        console.warn(`Weather service error: ${weatherError.message}`);
        // Create a basic forecast summary if weather service fails
        forecastSummary = {
          totalRainfall: 0,
          maxTemperature: 25,
          minTemperature: 15,
          maxWindSpeed: 10,
          rainHours: 0,
          heavyRainHours: 0,
          windHours: 0,
          conditions: ['unknown'],
          forecastPeriod: '48 hours',
          location: { lat, lon, name: 'Unknown' }
        };
      }
      
      // Add weather warnings to forecast summary
      forecastSummary.warnings = weatherWarnings;
      
      // Generate advice using AI or fallback
      let advice;
      const useAI = options.useAI !== false && this.geminiService.isAvailable();
      
      if (useAI) {
        try {
          advice = await this.geminiService.generateAdvice(
            forecastSummary, 
            seasonInfo.season, 
            cropType
          );
          
          // Add weather warnings to AI advice
          if (weatherWarnings.length > 0) {
            advice.warnings = [...weatherWarnings, ...advice.warnings];
          }
          
        } catch (aiError) {
          console.warn(`AI service error: ${aiError.message}`);
          // Fallback to basic advice
          advice = generateBasicSeasonalAdvice(cropType, seasonInfo.season, forecastSummary);
        }
      } else {
        // Use basic seasonal advice
        advice = generateBasicSeasonalAdvice(cropType, seasonInfo.season, forecastSummary);
      }
      
      // Add metadata
      advice.metadata = {
        ...advice.metadata,
        generated_at: new Date().toISOString(),
        location: { lat, lon },
        season_info: seasonInfo,
        weather_service_available: this.weatherService.isAvailable(),
        ai_service_available: this.geminiService.isAvailable(),
        advice_source: useAI ? 'gemini_ai' : 'basic_seasonal',
        api_version: '1.0.0'
      };
      
      return advice;
      
    } catch (error) {
      throw new Error(`Failed to generate advice: ${error.message}`);
    }
  }
  
  /**
   * Get available crops
   * @returns {Array} List of supported crops
   */
  getAvailableCrops() {
    return ['maize', 'beans', 'potatoes', 'bananas'];
  }
  
  /**
   * Get current season information
   * @returns {Object} Current season details
   */
  getCurrentSeason() {
    return detectCurrentSeason();
  }
  
  /**
   * Get service status
   * @returns {Object} Status of all services
   */
  getServiceStatus() {
    return {
      weather: this.weatherService.getStatus(),
      gemini: this.geminiService.getStatus(),
      advice: {
        available: true,
        version: '1.0.0'
      }
    };
  }
  
  /**
   * Validate and set coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Validated coordinates
   */
  validateAndSetCoordinates(lat, lon) {
    if (lat && lon) {
      if (!validateCoordinates(lat, lon)) {
        throw new Error('Invalid coordinates provided');
      }
      return { lat, lon };
    }
    
    // Use default coordinates (Kigali, Rwanda)
    return getDefaultCoordinates();
  }
  
  /**
   * Get basic advice without external API calls (for testing/fallback)
   * @param {string} cropType - Type of crop
   * @returns {Object} Basic advice
   */
  getBasicAdvice(cropType) {
    if (!validateCropType(cropType)) {
      throw new Error(`Unsupported crop type: ${cropType}`);
    }
    
    const seasonInfo = detectCurrentSeason();
    const basicForecast = {
      totalRainfall: 0,
      maxTemperature: 25,
      minTemperature: 15,
      maxWindSpeed: 10,
      rainHours: 0,
      heavyRainHours: 0,
      windHours: 0,
      conditions: ['unknown'],
      forecastPeriod: '48 hours',
      location: { lat: -1.9441, lon: 30.0619, name: 'Kigali, Rwanda' }
    };
    
    return generateBasicSeasonalAdvice(cropType, seasonInfo.season, basicForecast);
  }
}

export default new AdviceService();
