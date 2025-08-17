import adviceService from '../services/adviceService.js';
import { validateAdviceRequest } from '../middlewares/validationMiddleware.js';

/**
 * Controller for handling farming advice requests
 */
class AdviceController {
  
  /**
   * Generate farming advice based on location, crop, and weather
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateAdvice(req, res) {
    try {
      // Validate request
      const validation = validateAdviceRequest(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }
      
      const { lat, lon, crop, useAI } = req.body;
      
      // Generate advice
      const advice = await adviceService.generateAdvice({
        lat: lat ? parseFloat(lat) : undefined,
        lon: lon ? parseFloat(lon) : undefined,
        crop,
        useAI: useAI !== false // Default to true unless explicitly set to false
      });
      
      res.status(200).json({
        success: true,
        data: advice,
        message: 'Farming advice generated successfully'
      });
      
    } catch (error) {
      console.error('Advice generation error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate farming advice',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get available crops
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableCrops(req, res) {
    try {
      const crops = adviceService.getAvailableCrops();
      
      res.status(200).json({
        success: true,
        data: {
          crops,
          count: crops.length,
          description: 'Supported crop types for farming advice'
        }
      });
      
    } catch (error) {
      console.error('Get crops error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve available crops',
        message: error.message
      });
    }
  }
  
  /**
   * Get current season information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentSeason(req, res) {
    try {
      const seasonInfo = adviceService.getCurrentSeason();
      
      res.status(200).json({
        success: true,
        data: seasonInfo,
        message: 'Current season information retrieved successfully'
      });
      
    } catch (error) {
      console.error('Get season error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve current season information',
        message: error.message
      });
    }
  }
  
  /**
   * Get service status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getServiceStatus(req, res) {
    try {
      const status = adviceService.getServiceStatus();
      
      res.status(200).json({
        success: true,
        data: status,
        message: 'Service status retrieved successfully'
      });
      
    } catch (error) {
      console.error('Get status error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve service status',
        message: error.message
      });
    }
  }
  
  /**
   * Get basic advice without external API calls (for testing)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBasicAdvice(req, res) {
    try {
      const { crop } = req.params;
      
      if (!crop) {
        return res.status(400).json({
          success: false,
          error: 'Crop parameter is required'
        });
      }
      
      const advice = adviceService.getBasicAdvice(crop);
      
      res.status(200).json({
        success: true,
        data: advice,
        message: 'Basic farming advice generated successfully',
        note: 'This advice is generated without external API calls and may be less accurate'
      });
      
    } catch (error) {
      console.error('Basic advice error:', error);
      
      if (error.message.includes('Unsupported crop type')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid crop type',
          message: error.message,
          supported_crops: adviceService.getAvailableCrops()
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate basic advice',
        message: error.message
      });
    }
  }
  
  /**
   * Health check for the advice service
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async healthCheck(req, res) {
    try {
      const status = adviceService.getServiceStatus();
      
      const isHealthy = status.weather.available || status.gemini.available;
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'Season-Aware Farming Advisor',
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: status,
        message: isHealthy 
          ? 'All services are operational' 
          : 'Some services are unavailable'
      });
      
    } catch (error) {
      console.error('Health check error:', error);
      
      res.status(503).json({
        success: false,
        service: 'Season-Aware Farming Advisor',
        status: 'unhealthy',
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new AdviceController();
