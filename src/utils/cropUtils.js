import config from '../config/config.js';

/**
 * Get crop information by crop type
 * @param {string} cropType - The type of crop (maize, beans, potatoes, bananas)
 * @returns {Object} Crop information
 */
export const getCropInfo = (cropType) => {
  const crop = config.crops[cropType.toLowerCase()];
  if (!crop) {
    throw new Error(`Unsupported crop type: ${cropType}`);
  }
  return crop;
};

/**
 * Get all supported crops
 * @returns {Array} Array of supported crop types
 */
export const getSupportedCrops = () => {
  return Object.keys(config.crops);
};

/**
 * Check if a crop is suitable for the current season
 * @param {string} cropType - The type of crop
 * @param {string} season - The current season
 * @returns {boolean} True if crop is suitable for the season
 */
export const isCropSuitableForSeason = (cropType, season) => {
  const crop = getCropInfo(cropType);
  
  if (crop.season === 'all') return true;
  return crop.season === season;
};

/**
 * Generate basic seasonal advice for a crop (fallback when Gemini API fails)
 * @param {string} cropType - The type of crop
 * @param {string} season - The current season
 * @param {Object} forecastSummary - Weather forecast summary
 * @returns {Object} Basic farming advice
 */
export const generateBasicSeasonalAdvice = (cropType, season, forecastSummary) => {
  const crop = getCropInfo(cropType);
  const advice = {
    forecast_summary: `Weather forecast for next 48 hours: ${forecastSummary.totalRainfall}mm rainfall, ${forecastSummary.minTemperature}°C to ${forecastSummary.maxTemperature}°C, wind up to ${forecastSummary.maxWindSpeed} km/h`,
    season: season,
    crop: cropType,
    actions: [],
    warnings: [],
    productivity_tips: []
  };
  
  // Season-specific actions
  switch (season) {
    case 'shortDry':
      advice.actions.push('Prepare irrigation systems for water-dependent crops');
      advice.actions.push('Apply mulch to retain soil moisture');
      advice.actions.push('Consider drought-resistant crop varieties');
      break;
      
    case 'longRains':
      advice.actions.push('Ensure proper drainage systems are in place');
      advice.actions.push('Plant crops that thrive in wet conditions');
      advice.actions.push('Monitor for fungal diseases due to high humidity');
      break;
      
    case 'longDry':
      advice.actions.push('Implement water conservation techniques');
      advice.actions.push('Use shade nets for sensitive crops');
      advice.actions.push('Focus on drought-tolerant crops');
      break;
      
    case 'shortRains':
      advice.actions.push('Take advantage of moisture for planting');
      advice.actions.push('Prepare for the upcoming dry season');
      advice.actions.push('Harvest crops before heavy rains');
      break;
  }
  
  // Weather-specific actions
  if (forecastSummary.totalRainfall === 0) {
    advice.actions.push('Schedule irrigation for water-dependent crops');
    advice.actions.push('Check soil moisture levels regularly');
  }
  
  if (forecastSummary.heavyRainHours > 0) {
    advice.actions.push('Secure any loose structures or equipment');
    advice.actions.push('Ensure drainage channels are clear');
  }
  
  if (forecastSummary.maxWindSpeed >= config.weatherThresholds.windSpeed.warning) {
    advice.actions.push('Provide wind protection for tall crops');
    advice.actions.push('Secure trellises and support structures');
  }
  
  // Crop-specific productivity tips
  switch (cropType.toLowerCase()) {
    case 'maize':
      advice.productivity_tips.push('Plant in rows with proper spacing (75cm between rows)');
      advice.productivity_tips.push('Apply nitrogen fertilizer in split applications');
      advice.productivity_tips.push('Control weeds early in the growing season');
      break;
      
    case 'beans':
      advice.productivity_tips.push('Use trellises for climbing varieties');
      advice.productivity_tips.push('Plant in well-drained soil with good organic matter');
      advice.productivity_tips.push('Harvest pods when they are young and tender');
      break;
      
    case 'potatoes':
      advice.productivity_tips.push('Plant in loose, well-drained soil');
      advice.productivity_tips.push('Hill soil around plants as they grow');
      advice.productivity_tips.push('Control potato beetles and other pests');
      break;
      
    case 'bananas':
      advice.productivity_tips.push('Provide regular watering and fertilization');
      advice.productivity_tips.push('Remove suckers to maintain single stem');
      advice.productivity_tips.push('Support heavy bunches with props');
      break;
  }
  
  // Add weather warnings
  if (forecastSummary.warnings) {
    advice.warnings.push(...forecastSummary.warnings);
  }
  
  return advice;
};

/**
 * Validate crop type
 * @param {string} cropType - The crop type to validate
 * @returns {boolean} True if crop type is valid
 */
export const validateCropType = (cropType) => {
  return cropType && config.crops[cropType.toLowerCase()];
};

/**
 * Get crop water requirements
 * @param {string} cropType - The type of crop
 * @returns {string} Water requirement level
 */
export const getCropWaterRequirement = (cropType) => {
  const crop = getCropInfo(cropType);
  return crop.waterNeeds;
};

/**
 * Get crop growth period
 * @param {string} cropType - The type of crop
 * @returns {string} Growth period information
 */
export const getCropGrowthPeriod = (cropType) => {
  const crop = getCropInfo(cropType);
  return crop.growthPeriod;
};
