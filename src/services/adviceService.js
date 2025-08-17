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
   * @param {number} options.soilPh - Soil pH (optional)
   * @param {string} options.growthState - Growth state (optional)
   * @param {string} options.variety - Crop variety (optional)
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
      
      // Validate additional fields
      const additionalData = this.validateAdditionalData(options);
      
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
            cropType,
            additionalData
          );
          
          // Add weather warnings to AI advice
          if (weatherWarnings.length > 0) {
            advice.warnings = [...weatherWarnings, ...advice.warnings];
          }
          
        } catch (aiError) {
          console.warn(`AI service error: ${aiError.message}`);
          // Fallback to basic advice
          advice = generateBasicSeasonalAdvice(cropType, seasonInfo.season, forecastSummary, additionalData);
        }
      } else {
        // Use basic seasonal advice
        advice = generateBasicSeasonalAdvice(cropType, seasonInfo.season, forecastSummary, additionalData);
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
        additional_data: additionalData,
        api_version: '1.0.0'
      };
      
      return advice;
      
    } catch (error) {
      throw new Error(`Failed to generate advice: ${error.message}`);
    }
  }
  
  /**
   * Validate additional data fields
   * @param {Object} options - Request options
   * @returns {Object} Validated additional data
   */
  validateAdditionalData(options) {
    const additionalData = {};
    
    // Validate soil pH
    if (options.soilPh !== undefined && options.soilPh !== null) {
      if (typeof options.soilPh !== 'number' || options.soilPh < 4.0 || options.soilPh > 8.5) {
        throw new Error('Soil pH must be a number between 4.0 and 8.5');
      }
      additionalData.soilPh = options.soilPh;
    }
    
    // Validate growth state
    if (options.growthState) {
      const validGrowthStates = ['germination', 'vegetative', 'flowering', 'fruiting'];
      if (!validGrowthStates.includes(options.growthState.toLowerCase())) {
        throw new Error(`Invalid growth state. Must be one of: ${validGrowthStates.join(', ')}`);
      }
      additionalData.growthState = options.growthState.toLowerCase();
    }
    
    // Validate variety
    if (options.variety) {
      if (typeof options.variety !== 'string' || options.variety.trim() === '') {
        throw new Error('Variety must be a non-empty string');
      }
      additionalData.variety = options.variety.trim();
    }
    
    return additionalData;
  }
  
  /**
   * Get available crops
   * @returns {Array} List of supported crops
   */
  getAvailableCrops() {
    return ['maize', 'beans', 'potatoes', 'bananas'];
  }
  
  /**
   * Get crop varieties for a specific crop
   * @param {string} cropType - The type of crop
   * @returns {Object} Available varieties
   */
  async getCropVarieties(cropType) {
    if (!validateCropType(cropType)) {
      throw new Error(`Unsupported crop type: ${cropType}`);
    }
    
    const { getCropVarieties } = await import('../utils/cropUtils.js');
    return getCropVarieties(cropType);
  }
  
  /**
   * Get crop growth states
   * @returns {Array} Available growth states
   */
  getGrowthStates() {
    return ['germination', 'vegetative', 'flowering', 'fruiting'];
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
   * @param {Object} additionalData - Additional data (soil pH, growth state, variety)
   * @returns {Object} Basic advice
   */
  getBasicAdvice(cropType, additionalData = {}) {
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
    
    return generateBasicSeasonalAdvice(cropType, seasonInfo.season, basicForecast, additionalData);
  }
}

export default new AdviceService();
