import multer from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { CustomError, ErrorCodes } from '../utils/errorHandler.js';

const createUploadDirs = () => {
    const dirs = [
        join(process.cwd(), 'uploads'),
        join(process.cwd(), 'uploads', 'documents'),
        join(process.cwd(), 'uploads', 'pets')
    ];

    dirs.forEach(dir => {
        try {
            mkdirSync(dir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw new CustomError(
                    ErrorCodes.FILE_UPLOAD_ERROR,
                    `Error creating upload directory: ${error.message}`
                );
            }
        }
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.path.includes('documents') ? 'documents' : 'pets';
        cb(null, join(process.cwd(), 'uploads', type));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (!allowedTypes.includes(file.mimetype)) {
        cb(new CustomError(
            ErrorCodes.INVALID_FILE_TYPE,
            'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'
        ), false);
        return;
    }
    
    cb(null, true);
};

const errorHandler = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                code: ErrorCodes.FILE_SIZE_LIMIT_EXCEEDED,
                message: 'File size limit exceeded'
            });
        }
        return res.status(400).json({
            status: 'error',
            code: ErrorCodes.FILE_UPLOAD_ERROR,
            message: error.message
        });
    }
    next(error);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

createUploadDirs();

export { upload, errorHandler }; 