import logger from './logger.js';

export const ErrorCodes = {
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_USER_ROLE: 'INVALID_USER_ROLE',
    PET_NOT_FOUND: 'PET_NOT_FOUND',
    INVALID_PET_STATUS: 'INVALID_PET_STATUS',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    FILE_SIZE_LIMIT_EXCEEDED: 'FILE_SIZE_LIMIT_EXCEEDED',
    ADOPTION_NOT_FOUND: 'ADOPTION_NOT_FOUND',
    ADOPTION_ALREADY_EXISTS: 'ADOPTION_ALREADY_EXISTS',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

export class CustomError extends Error {
    constructor(code, message, statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'CustomError';
    }
}

export const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', err);

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.code,
            message: err.message
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            code: ErrorCodes.TOKEN_EXPIRED,
            message: 'Token expired'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            code: ErrorCodes.VALIDATION_ERROR,
            message: err.message
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            code: ErrorCodes.USER_ALREADY_EXISTS,
            message: 'User already exists'
        });
    }

    return res.status(500).json({
        status: 'error',
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error'
    });
}; 