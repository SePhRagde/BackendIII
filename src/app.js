import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './utils/errorHandler.js';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

// Import routes
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import loggerRouter from './routes/logger.router.js';
import mocksRouter from './routes/mocks.router.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/logger', loggerRouter);
app.use('/api/mocks', mocksRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Route not found'
    });
});

export default app;
