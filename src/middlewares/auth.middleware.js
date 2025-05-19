import jwt from 'jsonwebtoken';
import { CustomError, ErrorCodes } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomError(
                ErrorCodes.UNAUTHORIZED,
                'No token provided',
                401
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        logger.info(`User authenticated: ${decoded.email}`);
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new CustomError(
                ErrorCodes.INVALID_TOKEN,
                'Invalid token',
                401
            ));
        } else if (error.name === 'TokenExpiredError') {
            next(new CustomError(
                ErrorCodes.TOKEN_EXPIRED,
                'Token expired',
                401
            ));
        } else {
            next(error);
        }
    }
}; 