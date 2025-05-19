import 'dotenv/config';
import app from './app.js';
import mongoose from 'mongoose';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pet-adoption';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

logger.info(`Attempting to connect to MongoDB with URI: ${MONGODB_URI}`);

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
}); 