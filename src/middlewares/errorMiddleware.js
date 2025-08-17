import config from '../config/config.js';

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Default error response
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let errorDetails = null;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation Error';
    errorDetails = err.details || err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid Data Format';
  } else if (err.code === 'ENOTFOUND') {
    statusCode = 503;
    errorMessage = 'Service Unavailable';
  } else if (err.code === 'ECONNABORTED') {
    statusCode = 504;
    errorMessage = 'Request Timeout';
  } else if (err.message && err.message.includes('API key')) {
    statusCode = 401;
    errorMessage = 'Authentication Error';
  } else if (err.message && err.message.includes('rate limit')) {
    statusCode = 429;
    errorMessage = 'Too Many Requests';
  } else if (err.message && err.message.includes('not found')) {
    statusCode = 404;
    errorMessage = 'Resource Not Found';
  }
  
  // Create error response
  const errorResponse = {
    success: false,
    error: errorMessage,
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };
  
  // Add error details in development mode
  if (config.nodeEnv === 'development' && errorDetails) {
    errorResponse.details = errorDetails;
  }
  
  // Add stack trace in development mode
  if (config.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.url} was not found`,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health',
      advice: 'POST /api/advice',
      crops: 'GET /api/advice/crops',
      season: 'GET /api/advice/season',
      status: 'GET /api/advice/status',
      basicAdvice: 'GET /api/advice/basic/:crop'
    }
  });
};

/**
 * Async error wrapper middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 200 && status < 300 ? '✅' : 
                       status >= 400 && status < 500 ? '⚠️' : '❌';
    
    console.log(`${statusEmoji} ${req.method} ${req.url} - ${status} (${duration}ms)`);
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};
