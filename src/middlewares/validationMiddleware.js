import Joi from 'joi';

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
