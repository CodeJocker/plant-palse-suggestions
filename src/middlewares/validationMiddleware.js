import Joi from 'joi';
import config from '../config/config.js';

/**
 * Validation schema for advice request
 */
const adviceRequestSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).optional()
    .messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  
  lon: Joi.number().min(-180).max(180).optional()
    .messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  
  crop: Joi.string().required()
    .valid('maize', 'beans', 'potatoes', 'bananas')
    .messages({
      'string.empty': 'Crop type is required',
      'any.required': 'Crop type is required',
      'any.only': 'Crop type must be one of: maize, beans, potatoes, bananas'
    }),
  
  soilPh: Joi.number().min(4.0).max(8.5).optional()
    .messages({
      'number.base': 'Soil pH must be a number',
      'number.min': 'Soil pH must be between 4.0 and 8.5',
      'number.max': 'Soil pH must be between 4.0 and 8.5'
    }),
  
  growthState: Joi.string().valid('germination', 'vegetative', 'flowering', 'fruiting').optional()
    .messages({
      'string.empty': 'Growth state cannot be empty',
      'any.only': 'Growth state must be one of: germination, vegetative, flowering, fruiting'
    }),
  
  variety: Joi.string().optional()
    .messages({
      'string.empty': 'Variety cannot be empty'
    }),
  
  useAI: Joi.boolean().optional()
    .messages({
      'boolean.base': 'useAI must be a boolean value'
    })
});

/**
 * Validate advice request
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
export const validateAdviceRequest = (data) => {
  const { error, value } = adviceRequestSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return {
      isValid: false,
      errors,
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};

/**
 * Validation schema for coordinates
 */
const coordinatesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required()
    .messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  
  lon: Joi.number().min(-180).max(180).required()
    .messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    })
});

/**
 * Validate coordinates
 * @param {Object} data - Coordinate data to validate
 * @returns {Object} Validation result
 */
export const validateCoordinates = (data) => {
  const { error, value } = coordinatesSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return {
      isValid: false,
      errors: [],
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};

/**
 * Validation schema for crop type
 */
const cropTypeSchema = Joi.string().required()
  .valid('maize', 'beans', 'potatoes', 'bananas')
  .messages({
    'string.empty': 'Crop type is required',
    'any.required': 'Crop type is required',
    'any.only': 'Crop type must be one of: maize, beans, potatoes, bananas'
  });

/**
 * Validate crop type
 * @param {string} cropType - Crop type to validate
 * @returns {Object} Validation result
 */
export const validateCropType = (cropType) => {
  const { error, value } = cropTypeSchema.validate(cropType);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return {
      isValid: false,
      errors: [],
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};

/**
 * Validate soil pH
 * @param {number} soilPh - Soil pH value to validate
 * @returns {Object} Validation result
 */
export const validateSoilPh = (soilPh) => {
  if (soilPh === undefined || soilPh === null) {
    return { isValid: true, errors: [], value: null };
  }
  
  const { error, value } = Joi.number().min(4.0).max(8.5).validate(soilPh);
  
  if (error) {
    return {
      isValid: false,
      errors: [{
        field: 'soilPh',
        message: 'Soil pH must be between 4.0 and 8.5',
        value: soilPh
      }],
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};

/**
 * Validate growth state
 * @param {string} growthState - Growth state to validate
 * @returns {Object} Validation result
 */
export const validateGrowthState = (growthState) => {
  if (growthState === undefined || growthState === null) {
    return { isValid: true, errors: [], value: null };
  }
  
  const { error, value } = Joi.string().valid('germination', 'vegetative', 'flowering', 'fruiting').validate(growthState);
  
  if (error) {
    return {
      isValid: false,
      errors: [{
        field: 'growthState',
        message: 'Growth state must be one of: germination, vegetative, flowering, fruiting',
        value: growthState
      }],
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};
