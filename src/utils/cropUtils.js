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
 * Get crop varieties for a specific crop
 * @param {string} cropType - The type of crop
 * @returns {Object} Available varieties
 */
export const getCropVarieties = (cropType) => {
  const crop = getCropInfo(cropType);
  return crop.varieties || {};
};

/**
 * Get crop soil pH requirements
 * @param {string} cropType - The type of crop
 * @returns {Object} Soil pH requirements
 */
export const getCropSoilPh = (cropType) => {
  const crop = getCropInfo(cropType);
  return crop.soilPh || { min: 6.0, max: 7.0, optimal: 6.5 };
};

/**
 * Get crop growth states
 * @param {string} cropType - The type of crop
 * @returns {Array} Available growth states
 */
export const getCropGrowthStates = (cropType) => {
  const crop = getCropInfo(cropType);
  return crop.growthStates || ['germination', 'vegetative', 'flowering', 'fruiting'];
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
 * Check if soil pH is suitable for a crop
 * @param {string} cropType - The type of crop
 * @param {number} soilPh - The soil pH value
 * @returns {Object} Suitability information
 */
export const isSoilPhSuitableForCrop = (cropType, soilPh) => {
  if (soilPh === undefined || soilPh === null) {
    return { suitable: true, message: 'Soil pH not specified', recommendation: null };
  }
  
  const cropPh = getCropSoilPh(cropType);
  const isSuitable = soilPh >= cropPh.min && soilPh <= cropPh.max;
  
  let message = '';
  let recommendation = null;
  
  if (isSuitable) {
    message = `Soil pH ${soilPh} is suitable for ${cropType}`;
  } else if (soilPh < cropPh.min) {
    message = `Soil pH ${soilPh} is too acidic for ${cropType}. Minimum required: ${cropPh.min}`;
    recommendation = 'Consider adding lime to raise soil pH';
  } else {
    message = `Soil pH ${soilPh} is too alkaline for ${cropType}. Maximum allowed: ${cropPh.max}`;
    recommendation = 'Consider adding sulfur or organic matter to lower soil pH';
  }
  
  return {
    suitable: isSuitable,
    message,
    recommendation,
    cropPhRange: cropPh,
    currentPh: soilPh
  };
};

/**
 * Get growth state information
 * @param {string} growthState - The growth state
 * @returns {Object} Growth state information
 */
export const getGrowthStateInfo = (growthState) => {
  if (!growthState) return null;
  
  const stateInfo = config.growthStates[growthState];
  if (!stateInfo) {
    throw new Error(`Invalid growth state: ${growthState}`);
  }
  
  return {
    state: growthState,
    ...stateInfo
  };
};

/**
 * Get soil pH category
 * @param {number} soilPh - The soil pH value
 * @returns {Object} Soil pH category information
 */
export const getSoilPhCategory = (soilPh) => {
  if (soilPh === undefined || soilPh === null) return null;
  
  if (soilPh >= 4.0 && soilPh <= 5.0) return config.soilPhCategories.very_acidic;
  if (soilPh >= 5.1 && soilPh <= 6.0) return config.soilPhCategories.acidic;
  if (soilPh >= 6.1 && soilPh <= 6.5) return config.soilPhCategories.slightly_acidic;
  if (soilPh >= 6.6 && soilPh <= 7.3) return config.soilPhCategories.neutral;
  if (soilPh >= 7.4 && soilPh <= 7.8) return config.soilPhCategories.slightly_alkaline;
  if (soilPh >= 7.9 && soilPh <= 8.5) return config.soilPhCategories.alkaline;
  
  return null;
};

/**
 * Generate basic seasonal advice for a crop (fallback when Gemini API fails)
 * @param {string} cropType - The type of crop
 * @param {string} season - The current season
 * @param {Object} forecastSummary - Weather forecast summary
 * @param {Object} additionalData - Additional data (soil pH, growth state, variety)
 * @returns {Object} Basic farming advice
 */
export const generateBasicSeasonalAdvice = (cropType, season, forecastSummary, additionalData = {}) => {
  const crop = getCropInfo(cropType);
  const { soilPh, growthState, variety } = additionalData;
  
  const advice = {
    forecast_summary: `Weather forecast for next 48 hours: ${forecastSummary.totalRainfall}mm rainfall, ${forecastSummary.minTemperature}°C to ${forecastSummary.maxTemperature}°C, wind up to ${forecastSummary.maxWindSpeed} km/h`,
    season: season,
    crop: cropType,
    soil_ph_analysis: "",
    growth_stage_advice: "",
    variety_specific_tips: "",
    actions: [],
    resources_needed: [],
    possible_diseases: [],
    warnings: [],
    productivity_tips: []
  };
  
  // Add soil pH specific advice
  if (soilPh !== undefined && soilPh !== null) {
    const soilSuitability = isSoilPhSuitableForCrop(cropType, soilPh);
    const phCategory = getSoilPhCategory(soilPh);
    
    if (!soilSuitability.suitable) {
      advice.warnings.push(soilSuitability.message);
      if (soilSuitability.recommendation) {
        advice.actions.push(soilSuitability.recommendation);
      }
    } else {
      advice.productivity_tips.push(`Soil pH ${soilPh} is optimal for ${cropType} growth`);
    }
    
    if (phCategory) {
      advice.productivity_tips.push(`Soil category: ${phCategory.description}`);
    }
    
    advice.soil_ph_analysis = `Soil pH ${soilPh} analysis: ${soilSuitability.message}`;
  }
  
  // Add growth state specific advice
  if (growthState) {
    const growthInfo = getGrowthStateInfo(growthState);
    if (growthInfo) {
      advice.productivity_tips.push(`Current growth stage: ${growthInfo.description} (${growthInfo.duration})`);
      advice.growth_stage_advice = `Growth stage ${growthState}: ${growthInfo.description}`;
      
      // Growth state specific actions
      switch (growthState) {
        case 'germination':
          advice.actions.push('Ensure consistent soil moisture for seed germination');
          advice.actions.push('Protect seedlings from extreme weather conditions');
          break;
        case 'vegetative':
          advice.actions.push('Provide adequate nitrogen for leaf and stem development');
          advice.actions.push('Control weeds to reduce competition for nutrients');
          break;
        case 'flowering':
          advice.actions.push('Ensure adequate water during flowering to prevent flower drop');
          advice.actions.push('Avoid spraying pesticides during flowering to protect pollinators');
          break;
        case 'fruiting':
          advice.actions.push('Provide balanced nutrition for fruit development');
          advice.actions.push('Support heavy fruit clusters to prevent breakage');
          break;
      }
    }
  }
  
  // Add variety specific advice
  if (variety && crop.varieties && crop.varieties[variety]) {
    const varietyInfo = crop.varieties[variety];
    advice.productivity_tips.push(`Variety: ${varietyInfo.description}`);
    advice.productivity_tips.push(`Drought resistance: ${varietyInfo.droughtResistance}`);
    advice.variety_specific_tips = `Variety ${variety}: ${varietyInfo.description} with ${varietyInfo.droughtResistance} drought resistance`;
    
    if (varietyInfo.droughtResistance === 'low' && forecastSummary.totalRainfall === 0) {
      advice.warnings.push(`Low drought resistance variety selected during dry conditions`);
      advice.actions.push('Increase irrigation frequency for this variety');
    }
  }
  
  // Season-specific actions and resources
  switch (season) {
    case 'shortDry':
      advice.actions.push('Prepare irrigation systems for water-dependent crops');
      advice.actions.push('Apply mulch to retain soil moisture');
      advice.actions.push('Consider drought-resistant crop varieties');
      
      advice.resources_needed.push({
        resource: 'Irrigation equipment',
        purpose: 'Water delivery to crops',
        quantity: 'As needed based on field size',
        cost_estimate: '50,000-200,000 RWF',
        where_to_get: 'Local agricultural supply stores'
      });
      advice.resources_needed.push({
        resource: 'Organic mulch',
        purpose: 'Soil moisture retention',
        quantity: '2-3 tons per hectare',
        cost_estimate: '15,000-25,000 RWF per ton',
        where_to_get: 'Local farms, agricultural cooperatives'
      });
      break;
      
    case 'longRains':
      advice.actions.push('Ensure proper drainage systems are in place');
      advice.actions.push('Plant crops that thrive in wet conditions');
      advice.actions.push('Monitor for fungal diseases due to high humidity');
      
      advice.resources_needed.push({
        resource: 'Drainage materials',
        purpose: 'Prevent waterlogging',
        quantity: 'As needed for field drainage',
        cost_estimate: '20,000-50,000 RWF',
        where_to_get: 'Construction supply stores'
      });
      advice.resources_needed.push({
        resource: 'Fungicides',
        purpose: 'Prevent fungal diseases',
        quantity: '2-3 applications per season',
        cost_estimate: '5,000-15,000 RWF per application',
        where_to_get: 'Agricultural chemical suppliers'
      });
      break;
      
    case 'longDry':
      advice.actions.push('Implement water conservation techniques');
      advice.actions.push('Use shade nets for sensitive crops');
      advice.actions.push('Focus on drought-tolerant crops');
      
      advice.resources_needed.push({
        resource: 'Shade nets',
        purpose: 'Protect crops from excessive sun',
        quantity: 'Cover entire field area',
        cost_estimate: '30,000-80,000 RWF per hectare',
        where_to_get: 'Agricultural supply stores'
      });
      advice.resources_needed.push({
        resource: 'Water storage containers',
        purpose: 'Store collected rainwater',
        quantity: '1000-5000 liters capacity',
        cost_estimate: '25,000-100,000 RWF',
        where_to_get: 'Hardware stores, agricultural suppliers'
      });
      break;
      
    case 'shortRains':
      advice.actions.push('Take advantage of moisture for planting');
      advice.actions.push('Prepare for the upcoming dry season');
      advice.actions.push('Harvest crops before heavy rains');
      
      advice.resources_needed.push({
        resource: 'Planting tools',
        purpose: 'Efficient crop planting',
        quantity: '1 set per farmer',
        cost_estimate: '15,000-30,000 RWF',
        where_to_get: 'Agricultural tool stores'
      });
      advice.resources_needed.push({
        resource: 'Harvesting equipment',
        purpose: 'Timely crop harvesting',
        quantity: 'As needed for crop type',
        cost_estimate: '10,000-50,000 RWF',
        where_to_get: 'Agricultural equipment suppliers'
      });
      break;
  }
  
  // Weather-specific actions and resources
  if (forecastSummary.totalRainfall === 0) {
    advice.actions.push('Schedule irrigation for water-dependent crops');
    advice.actions.push('Check soil moisture levels regularly');
    
    advice.resources_needed.push({
      resource: 'Soil moisture meter',
      purpose: 'Monitor soil water content',
      quantity: '1 per field',
      cost_estimate: '8,000-15,000 RWF',
      where_to_get: 'Agricultural supply stores'
    });
  }
  
  if (forecastSummary.heavyRainHours > 0) {
    advice.actions.push('Secure any loose structures or equipment');
    advice.actions.push('Ensure drainage channels are clear');
    
    advice.resources_needed.push({
      resource: 'Drainage tools',
      purpose: 'Clear drainage channels',
      quantity: '1 set per field',
      cost_estimate: '5,000-12,000 RWF',
      where_to_get: 'Hardware stores'
    });
  }
  
  if (forecastSummary.maxWindSpeed >= config.weatherThresholds.windSpeed.warning) {
    advice.actions.push('Provide wind protection for tall crops');
    advice.actions.push('Secure trellises and support structures');
    
    advice.resources_needed.push({
      resource: 'Wind barriers',
      purpose: 'Protect crops from wind damage',
      quantity: 'Perimeter of field',
      cost_estimate: '20,000-60,000 RWF per hectare',
      where_to_get: 'Agricultural supply stores'
    });
  }
  
  // Crop-specific resources and diseases
  switch (cropType.toLowerCase()) {
    case 'maize':
      advice.productivity_tips.push('Plant in rows with proper spacing (75cm between rows)');
      advice.productivity_tips.push('Apply nitrogen fertilizer in split applications');
      advice.productivity_tips.push('Control weeds early in the growing season');
      
      advice.resources_needed.push({
        resource: 'Nitrogen fertilizer (NPK)',
        purpose: 'Provide essential nutrients for growth',
        quantity: '200-300 kg per hectare',
        cost_estimate: '80,000-120,000 RWF per hectare',
        where_to_get: 'Agricultural cooperatives, fertilizer suppliers'
      });
      advice.resources_needed.push({
        resource: 'Weed control herbicides',
        purpose: 'Control competing weeds',
        quantity: '2-3 applications per season',
        cost_estimate: '15,000-25,000 RWF per application',
        where_to_get: 'Agricultural chemical suppliers'
      });
      
      advice.possible_diseases.push({
        disease_name: 'Maize Lethal Necrosis',
        symptoms: 'Yellowing leaves, stunted growth, poor grain development',
        risk_factors: 'High humidity, poor drainage, infected seeds',
        prevention: 'Use certified seeds, maintain field hygiene, proper spacing',
        treatment: 'Remove infected plants, apply fungicides if early detected',
        seasonal_risk: season === 'longRains' ? 'High' : 'Medium'
      });
      advice.possible_diseases.push({
        disease_name: 'Common Rust',
        symptoms: 'Reddish-brown pustules on leaves, reduced photosynthesis',
        risk_factors: 'High humidity, dense planting, poor air circulation',
        prevention: 'Plant resistant varieties, maintain proper spacing',
        treatment: 'Apply fungicides, remove infected plant debris',
        seasonal_risk: season === 'longRains' ? 'High' : 'Low'
      });
      break;
      
    case 'beans':
      advice.productivity_tips.push('Use trellises for climbing varieties');
      advice.productivity_tips.push('Plant in well-drained soil with good organic matter');
      advice.productivity_tips.push('Harvest pods when they are young and tender');
      
      advice.resources_needed.push({
        resource: 'Trellis materials',
        purpose: 'Support climbing bean varieties',
        quantity: 'Poles and strings for entire field',
        cost_estimate: '25,000-50,000 RWF per hectare',
        where_to_get: 'Local hardware stores, agricultural suppliers'
      });
      advice.resources_needed.push({
        resource: 'Organic compost',
        purpose: 'Improve soil fertility and structure',
        quantity: '5-10 tons per hectare',
        cost_estimate: '20,000-40,000 RWF per ton',
        where_to_get: 'Local farms, agricultural cooperatives'
      });
      
      advice.possible_diseases.push({
        disease_name: 'Bean Anthracnose',
        symptoms: 'Dark, sunken lesions on pods and stems',
        risk_factors: 'Wet weather, poor air circulation, infected seeds',
        prevention: 'Use disease-free seeds, crop rotation, proper spacing',
        treatment: 'Remove infected plants, apply copper-based fungicides',
        seasonal_risk: season === 'longRains' ? 'High' : 'Medium'
      });
      advice.possible_diseases.push({
        disease_name: 'Bean Rust',
        symptoms: 'Orange-brown pustules on leaves, defoliation',
        risk_factors: 'High humidity, dense planting, poor drainage',
        prevention: 'Plant resistant varieties, maintain field hygiene',
        treatment: 'Apply fungicides, remove infected debris',
        seasonal_risk: season === 'longRains' ? 'High' : 'Low'
      });
      break;
      
    case 'potatoes':
      advice.productivity_tips.push('Plant in loose, well-drained soil');
      advice.productivity_tips.push('Hill soil around plants as they grow');
      advice.productivity_tips.push('Control potato beetles and other pests');
      
      advice.resources_needed.push({
        resource: 'Potato hilling tools',
        purpose: 'Build soil mounds around potato plants',
        quantity: '1 set per farmer',
        cost_estimate: '8,000-15,000 RWF',
        where_to_get: 'Agricultural tool stores'
      });
      advice.resources_needed.push({
        resource: 'Insecticides',
        purpose: 'Control potato beetles and other pests',
        quantity: '2-3 applications per season',
        cost_estimate: '12,000-20,000 RWF per application',
        where_to_get: 'Agricultural chemical suppliers'
      });
      
      advice.possible_diseases.push({
        disease_name: 'Late Blight',
        symptoms: 'Dark lesions on leaves and stems, rapid plant death',
        risk_factors: 'Cool, wet weather, poor air circulation',
        prevention: 'Plant resistant varieties, proper spacing, avoid overhead irrigation',
        treatment: 'Apply copper-based fungicides, remove infected plants',
        seasonal_risk: season === 'longRains' ? 'High' : 'Low'
      });
      advice.possible_diseases.push({
        disease_name: 'Early Blight',
        symptoms: 'Brown spots with concentric rings on leaves',
        risk_factors: 'Warm, humid weather, poor nutrition',
        prevention: 'Maintain plant health, proper fertilization, crop rotation',
        treatment: 'Apply fungicides, remove infected leaves',
        seasonal_risk: season === 'longRains' ? 'Medium' : 'Low'
      });
      break;
      
    case 'bananas':
      advice.productivity_tips.push('Provide regular watering and fertilization');
      advice.productivity_tips.push('Remove suckers to maintain single stem');
      advice.productivity_tips.push('Support heavy bunches with props');
      
      advice.resources_needed.push({
        resource: 'Banana props',
        purpose: 'Support heavy fruit bunches',
        quantity: '1 prop per bearing plant',
        cost_estimate: '2,000-5,000 RWF each',
        where_to_get: 'Local craftsmen, agricultural suppliers'
      });
      advice.resources_needed.push({
        resource: 'Potassium fertilizer',
        purpose: 'Essential for banana fruit development',
        quantity: '300-500 kg per hectare',
        cost_estimate: '90,000-150,000 RWF per hectare',
        where_to_get: 'Agricultural cooperatives, fertilizer suppliers'
      });
      
      advice.possible_diseases.push({
        disease_name: 'Panama Disease (Fusarium Wilt)',
        symptoms: 'Yellowing leaves, wilting, plant death',
        risk_factors: 'Infected soil, poor drainage, monoculture',
        prevention: 'Use disease-free planting material, crop rotation, good drainage',
        treatment: 'Remove infected plants, soil fumigation if severe',
        seasonal_risk: season === 'longRains' ? 'High' : 'Medium'
      });
      advice.possible_diseases.push({
        disease_name: 'Black Sigatoka',
        symptoms: 'Dark streaks on leaves, reduced fruit quality',
        risk_factors: 'High humidity, poor air circulation, dense planting',
        prevention: 'Maintain proper spacing, remove infected leaves, fungicide application',
        treatment: 'Apply systemic fungicides, remove infected leaves',
        seasonal_risk: season === 'longRains' ? 'High' : 'Medium'
      });
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
