import express from 'express';
import adviceController from '../controllers/adviceController.js';

const router = express.Router();

/**
 * @route POST /api/advice
 * @desc Generate farming advice based on location, crop, and weather
 * @access Public
 */
router.post('/', adviceController.generateAdvice);

/**
 * @route GET /api/advice/crops
 * @desc Get list of available crops
 * @access Public
 */
router.get('/crops', adviceController.getAvailableCrops);

/**
 * @route GET /api/advice/varieties/:crop
 * @desc Get available varieties for a specific crop
 * @access Public
 */
router.get('/varieties/:crop', adviceController.getCropVarieties);

/**
 * @route GET /api/advice/growth-states
 * @desc Get available growth states
 * @access Public
 */
router.get('/growth-states', adviceController.getGrowthStates);

/**
 * @route GET /api/advice/season
 * @desc Get current agricultural season information
 * @access Public
 */
router.get('/season', adviceController.getCurrentSeason);

/**
 * @route GET /api/advice/status
 * @desc Get service status information
 * @access Public
 */
router.get('/status', adviceController.getServiceStatus);

/**
 * @route GET /api/advice/basic/:crop
 * @desc Get basic farming advice without external API calls (for testing)
 * @access Public
 */
router.get('/basic/:crop', adviceController.getBasicAdvice);

/**
 * @route GET /api/advice/health
 * @desc Health check for the advice service
 * @access Public
 */
router.get('/health', adviceController.healthCheck);

export default router;
