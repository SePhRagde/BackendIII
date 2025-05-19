import multer from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { CustomError, ErrorCodes } from '../utils/errorHandler.js';

// Create upload directories if they don't exist
const createUploadDirs = () => {
    const dirs = ['documents', 'pets'];
    dirs.forEach(dir => {
        try {
            mkdirSync(join(process.cwd(), 'uploads', dir), { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error(`Error creating ${dir} directory:`, error);
            }
        }
    });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.baseUrl.includes('users') ? 'documents' : 'pets';
        cb(null, join(process.cwd(), 'uploads', type));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new CustomError(
            'INVALID_FILE_TYPE',
            'Invalid file type. Only JPEG, PNG, GIF and PDF files are allowed.',
            400
        ), false);
    }
};

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new CustomError(
                'FILE_SIZE_LIMIT_EXCEEDED',
                'File too large',
                400
            ));
        }
        return next(new CustomError(
            ErrorCodes.VALIDATION_ERROR,
            err.message,
            400
        ));
    }
    return next(err);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export { upload, handleMulterError }; 