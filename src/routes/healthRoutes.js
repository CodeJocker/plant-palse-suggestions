import express from 'express';
import healthController from '../controllers/healthController.js';

const router = express.Router();

/**
 * @route GET /health
 * @desc Basic health check endpoint
 * @access Public
 */
router.get('/', healthController.basicHealth);

/**
 * @route GET /health/detailed
 * @desc Detailed health check with service status
 * @access Public
 */
router.get('/detailed', healthController.detailedHealth);

/**
 * @route GET /health/config
 * @desc Configuration health check
 * @access Public
 */
router.get('/config', healthController.configHealth);

export default router;
