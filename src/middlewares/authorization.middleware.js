import { CustomError, ErrorCodes } from '../utils/errorHandler.js';

export const authorization = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new CustomError(
                ErrorCodes.UNAUTHORIZED,
                'User not authenticated',
                401
            );
        }

        if (!roles.includes(req.user.role)) {
            throw new CustomError(
                ErrorCodes.UNAUTHORIZED,
                'Not authorized',
                403
            );
        }

        next();
    };
}; 