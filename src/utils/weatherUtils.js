import config from '../config/config.js';

/**
 * Detect Rwanda's current agricultural season based on current date
 * @returns {Object} Season information
 */
export const detectCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  let season;
  let description;
  
  if (month >= 1 && month <= 2) {
    season = 'shortDry';
    description = 'Short dry season - January to February';
  } else if (month >= 3 && month <= 5) {
    season = 'longRains';
    description = 'Long rainy season - March to May';
  } else if (month >= 6 && month <= 9) {
    season = 'longDry';
    description = 'Long dry season - June to September';
  } else {
    season = 'shortRains';
    description = 'Short rainy season - October to December';
  }
  
  return {
    season,
    description,
    currentMonth: month,
    ...config.seasons[season]
  };
};

/**
 * Process and summarize weather forecast data
 * @param {Object} forecastData - Raw forecast data from OpenWeather API
 * @returns {Object} Summarized forecast information
 */
export const summarizeForecast = (forecastData) => {
  if (!forecastData || !forecastData.list) {
    throw new Error('Invalid forecast data received');
  }
  
  const forecasts = forecastData.list.slice(0, 16); // First 48 hours (3-hour intervals)
  
  let totalRainfall = 0;
  let maxTemp = -Infinity;
  let minTemp = Infinity;
  let maxWindSpeed = 0;
  let rainHours = 0;
  let heavyRainHours = 0;
  let windHours = 0;
  
  forecasts.forEach(forecast => {
    const { main, rain, wind, weather } = forecast;
    
    // Temperature tracking
    if (main.temp > maxTemp) maxTemp = main.temp;
    if (main.temp < minTemp) minTemp = main.temp;
    
    // Rainfall tracking
    if (rain && rain['3h']) {
      totalRainfall += rain['3h'];
      rainHours++;
      
      if (rain['3h'] >= config.weatherThresholds.rainfall.heavy) {
        heavyRainHours++;
      }
    }
    
    // Wind tracking
    if (wind && wind.speed > maxWindSpeed) {
      maxWindSpeed = wind.speed;
    }
    
    if (wind && wind.speed >= config.weatherThresholds.windSpeed.warning) {
      windHours++;
    }
  });
  
  // Convert temperatures from Kelvin to Celsius
  const maxTempC = Math.round((maxTemp - 273.15) * 10) / 10;
  const minTempC = Math.round((minTemp - 273.15) * 10) / 10;
  
  // Convert wind speed from m/s to km/h
  const maxWindKmh = Math.round(maxWindSpeed * 3.6);
  
  // Determine weather conditions
  const conditions = [];
  if (totalRainfall > 0) conditions.push('rain');
  if (heavyRainHours > 0) conditions.push('heavy_rain');
  if (windHours > 0) conditions.push('wind');
  if (maxTempC > config.weatherThresholds.temperature.max) conditions.push('high_temperature');
  if (minTempC < config.weatherThresholds.temperature.min) conditions.push('low_temperature');
  
  return {
    totalRainfall: Math.round(totalRainfall * 10) / 10,
    maxTemperature: maxTempC,
    minTemperature: minTempC,
    maxWindSpeed: maxWindKmh,
    rainHours,
    heavyRainHours,
    windHours,
    conditions,
    forecastPeriod: '48 hours',
    location: {
      lat: forecastData.city.coord.lat,
      lon: forecastData.city.coord.lon,
      name: forecastData.city.name
    }
  };
};

/**
 * Generate weather warnings based on forecast data
 * @param {Object} forecastSummary - Summarized forecast data
 * @returns {Array} Array of warning messages
 */
export const generateWeatherWarnings = (forecastSummary) => {
  const warnings = [];
  
  // Temperature warnings
  if (forecastSummary.maxTemperature > config.weatherThresholds.temperature.max) {
    warnings.push(`High temperature warning: ${forecastSummary.maxTemperature}°C expected. Consider shade protection for crops.`);
  }
  
  if (forecastSummary.minTemperature < config.weatherThresholds.temperature.min) {
    warnings.push(`Low temperature warning: ${forecastSummary.minTemperature}°C expected. Protect sensitive crops from cold.`);
  }
  
  // Wind warnings
  if (forecastSummary.maxWindSpeed >= config.weatherThresholds.windSpeed.danger) {
    warnings.push(`Dangerous wind conditions: ${forecastSummary.maxWindSpeed} km/h expected. Secure structures and protect crops.`);
  } else if (forecastSummary.maxWindSpeed >= config.weatherThresholds.windSpeed.warning) {
    warnings.push(`Wind warning: ${forecastSummary.maxWindSpeed} km/h expected. Consider wind protection for tall crops.`);
  }
  
  // Rainfall warnings
  if (forecastSummary.heavyRainHours > 0) {
    warnings.push(`Heavy rainfall expected: ${forecastSummary.heavyRainHours} periods of heavy rain. Ensure proper drainage.`);
  }
  
  if (forecastSummary.totalRainfall === 0 && forecastSummary.rainHours === 0) {
    warnings.push('No rainfall expected in the next 48 hours. Consider irrigation for water-dependent crops.');
  }
  
  return warnings;
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export const validateCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};

/**
 * Get default coordinates (Kigali, Rwanda)
 * @returns {Object} Default latitude and longitude
 */
export const getDefaultCoordinates = () => {
  return {
    lat: config.defaultLat,
    lon: config.defaultLon
  };
};
