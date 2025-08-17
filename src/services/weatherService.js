import axios from 'axios';
import config from '../config/config.js';

/**
 * Service for interacting with OpenWeather API
 */
class WeatherService {
  constructor() {
    this.apiKey = config.openWeatherApiKey;
    this.baseUrl = config.openWeatherBaseUrl;
    
    if (!this.apiKey) {
      console.warn('⚠️  OpenWeather API key not provided. Weather data will not be available.');
    }
  }
  
  /**
   * Fetch 48-hour weather forecast for a specific location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather forecast data
   */
  async getForecast(lat, lon) {
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured');
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric', // Use metric units (Celsius, mm, m/s)
          cnt: 16 // Get 48 hours of forecast (3-hour intervals)
        },
        timeout: 10000 // 10 second timeout
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        // API responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        switch (status) {
          case 401:
            throw new Error('Invalid OpenWeather API key');
          case 404:
            throw new Error('Location not found');
          case 429:
            throw new Error('OpenWeather API rate limit exceeded');
          case 500:
            throw new Error('OpenWeather API server error');
          default:
            throw new Error(`OpenWeather API error: ${message}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('OpenWeather API request timeout');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Unable to connect to OpenWeather API');
      } else {
        throw new Error(`Weather service error: ${error.message}`);
      }
    }
  }
  
  /**
   * Get current weather for a specific location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Current weather data
   */
  async getCurrentWeather(lat, lon) {
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured');
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        switch (status) {
          case 401:
            throw new Error('Invalid OpenWeather API key');
          case 404:
            throw new Error('Location not found');
          case 429:
            throw new Error('OpenWeather API rate limit exceeded');
          default:
            throw new Error(`OpenWeather API error: ${message}`);
        }
      } else {
        throw new Error(`Weather service error: ${error.message}`);
      }
    }
  }
  
  /**
   * Check if the weather service is available
   * @returns {boolean} True if API key is configured
   */
  isAvailable() {
    return !!this.apiKey;
  }
  
  /**
   * Get service status information
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey
    };
  }
}

export default new WeatherService();
