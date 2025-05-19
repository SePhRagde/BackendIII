import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

router.get('/loggerTest', (req, res) => {
    try {
        // Test different log levels
        logger.debug('This is a debug message');
        logger.http('This is an http message');
        logger.info('This is an info message');
        logger.warning('This is a warning message');
        logger.error('This is an error message');
        logger.fatal('This is a fatal message');

        res.json({
            status: 'success',
            message: 'Logs generated successfully. Check console and logs/errors.log file.'
        });
    } catch (error) {
        logger.error('Error in logger test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error generating logs'
        });
    }
});

export default router; 