import adviceService from '../services/adviceService.js';
import config from '../config/config.js';

/**
 * Controller for handling health check requests
 */
class HealthController {
  
  /**
   * Basic health check endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async basicHealth(req, res) {
    try {
      res.status(200).json({
        success: true,
        service: 'Season-Aware Farming Advisor API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        uptime: process.uptime()
      });
    } catch (error) {
      console.error('Basic health check error:', error);
      
      res.status(500).json({
        success: false,
        service: 'Season-Aware Farming Advisor API',
        status: 'unhealthy',
        error: 'Health check failed',
        message: error.message
      });
    }
  }
  
  /**
   * Detailed health check with service status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async detailedHealth(req, res) {
    try {
      const serviceStatus = adviceService.getServiceStatus();
      
      // Determine overall health status
      const weatherAvailable = serviceStatus.weather.available;
      const geminiAvailable = serviceStatus.gemini.available;
      
      let overallStatus = 'healthy';
      if (!weatherAvailable && !geminiAvailable) {
        overallStatus = 'unhealthy';
      } else if (!weatherAvailable || !geminiAvailable) {
        overallStatus = 'degraded';
      }
      
      const response = {
        success: true,
        service: 'Season-Aware Farming Advisor API',
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        services: serviceStatus,
        system: {
          node_version: process.version,
          platform: process.platform,
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        }
      };
      
      res.status(overallStatus === 'unhealthy' ? 503 : 200).json(response);
      
    } catch (error) {
      console.error('Detailed health check error:', error);
      
      res.status(503).json({
        success: false,
        service: 'Season-Aware Farming Advisor API',
        status: 'unhealthy',
        error: 'Detailed health check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Configuration health check
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async configHealth(req, res) {
    try {
      const configStatus = {
        environment: config.nodeEnv,
        port: config.port,
        hasOpenWeatherKey: !!config.openWeatherApiKey,
        hasGeminiKey: !!config.geminiApiKey,
        defaultLocation: {
          lat: config.defaultLat,
          lon: config.defaultLon
        },
        rateLimiting: {
          windowMs: config.rateLimitWindowMs,
          maxRequests: config.rateLimitMaxRequests
        }
      };
      
      res.status(200).json({
        success: true,
        service: 'Season-Aware Farming Advisor API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        config: configStatus
      });
      
    } catch (error) {
      console.error('Config health check error:', error);
      
      res.status(500).json({
        success: false,
        service: 'Season-Aware Farming Advisor API',
        status: 'unhealthy',
        error: 'Configuration health check failed',
        message: error.message
      });
    }
  }
}

export default new HealthController();
