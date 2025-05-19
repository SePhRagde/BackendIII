import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { upload, errorHandler } from '../config/multer.config.js';
import logger from '../utils/logger.js';
import { CustomError, ErrorCodes } from '../utils/errorHandler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';

const router = Router();

router.get('/',usersController.getAllUsers);

router.get('/:uid',usersController.getUser);
router.put('/:uid',usersController.updateUser);
router.delete('/:uid',usersController.deleteUser);

/**
 * @swagger
 * /api/users/{uid}/documents:
 *   post:
 *     summary: Upload user documents
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/:uid/documents', authMiddleware, upload.array('documents', 5), errorHandler, async (req, res, next) => {
    try {
        const { uid } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            throw new CustomError(
                ErrorCodes.VALIDATION_ERROR,
                'No files were uploaded',
                400
            );
        }

        // Check if user is authorized to upload documents
        if (req.user.id !== uid && req.user.role !== 'admin') {
            throw new CustomError(
                ErrorCodes.UNAUTHORIZED,
                'You are not authorized to upload documents for this user',
                403
            );
        }

        // Update user's documents array
        const documents = files.map(file => ({
            name: file.originalname,
            reference: file.filename
        }));

        await User.findByIdAndUpdate(uid, {
            $push: { documents: { $each: documents } }
        });

        logger.info(`Documents uploaded for user ${uid}`);
        res.json({
            status: 'success',
            message: 'Documents uploaded successfully',
            payload: documents
        });
    } catch (error) {
        next(error);
    }
});

export default router;